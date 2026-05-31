import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, Subtask } from '../types';

// ============================================================
// useTasks — Supabase-backed hook
// All reads/writes go directly to Supabase.
// ============================================================
export function useTasks(projectId: string | null) {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ----------------------------------------------------------
  // Fetch
  // ----------------------------------------------------------
  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      setTasks((data as Task[]) ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load tasks');
      console.error('[useTasks] fetchTasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ----------------------------------------------------------
  // Add a single task
  // ----------------------------------------------------------
  const addTask = useCallback(
    async (text: string, image: string | null, subtasks: Subtask[]) => {
      if (!projectId) return;

      const nextPosition = tasks.length;

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            project_id: projectId,
            text,
            image,
            subtasks: subtasks as any,
            position: nextPosition,
            completed: false,
            archived: false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setTasks((prev) => [...prev, data as Task]);
    },
    [projectId, tasks.length]
  );

  // ----------------------------------------------------------
  // Update a task (optimistic)
  // ----------------------------------------------------------
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      // Optimistic update
      const previousTasks = tasks;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates as any)
        .eq('id', id);

      if (updateError) {
        setTasks(previousTasks); // Revert on failure
        throw updateError;
      }
    },
    [tasks]
  );

  // ----------------------------------------------------------
  // Delete a task (optimistic)
  // ----------------------------------------------------------
  const deleteTask = useCallback(
    async (id: string) => {
      const previousTasks = tasks;
      setTasks((prev) => prev.filter((t) => t.id !== id));

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setTasks(previousTasks); // Revert on failure
        throw deleteError;
      }
    },
    [tasks]
  );

  // ----------------------------------------------------------
  // Status helpers
  // ----------------------------------------------------------
  const toggleComplete = useCallback(
    (id: string, completed: boolean) => updateTask(id, { completed }),
    [updateTask]
  );

  const archiveTask = useCallback(
    (id: string) => updateTask(id, { archived: true }),
    [updateTask]
  );

  const unarchiveTask = useCallback(
    (id: string) => updateTask(id, { archived: false }),
    [updateTask]
  );

  // ----------------------------------------------------------
  // Reorder — uses the reorder_tasks() RPC for a single
  // round-trip update instead of N sequential queries.
  // ----------------------------------------------------------
  const reorderTasks = useCallback(
    async (activeId: string, overId: string) => {
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Build new ordered array
      const reordered = [...tasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const withPositions = reordered.map((t, i) => ({ ...t, position: i }));
      setTasks(withPositions); // Optimistic update

      // Single RPC call — defined in supabase/migrations/001_initial_schema.sql
      const payload = withPositions.map((t) => ({ id: t.id, position: t.position }));

      const { error: rpcError } = await supabase.rpc('reorder_tasks', {
        updates: payload,
      });

      if (rpcError) {
        // If RPC fails, fall back to sequential updates
        console.warn('[useTasks] reorder_tasks RPC failed, falling back:', rpcError.message);
        for (const t of withPositions) {
          await supabase.from('tasks').update({ position: t.position }).eq('id', t.id);
        }
      }
    },
    [tasks]
  );

  // ----------------------------------------------------------
  // Bulk create (AI-generated tasks)
  // ----------------------------------------------------------
  const bulkCreateTasks = useCallback(
    async (
      inputs: Omit<Task, 'id' | 'project_id' | 'position' | 'created_at' | 'updated_at'>[]
    ) => {
      if (!projectId) return;

      const rows = inputs.map((t, i) => ({
        ...t,
        project_id: projectId,
        position: tasks.length + i,
        subtasks: (t.subtasks ?? []) as any,
      }));

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(rows)
        .select();

      if (insertError) throw insertError;

      setTasks((prev) => [...prev, ...((data as Task[]) ?? [])]);
    },
    [projectId, tasks.length]
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    archiveTask,
    unarchiveTask,
    reorderTasks,
    bulkCreateTasks,
    refetch: fetchTasks,
  };
}
