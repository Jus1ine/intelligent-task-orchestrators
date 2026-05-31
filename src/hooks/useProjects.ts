import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../types';

// ============================================================
// useProjects — Supabase-backed hook
// All CRUD operations go directly to Supabase.
// ============================================================
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // Fetch all projects (ordered newest-first)
  // ----------------------------------------------------------
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects((data as Project[]) ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load projects');
      console.error('[useProjects] fetchProjects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ----------------------------------------------------------
  // Create
  // ----------------------------------------------------------
  const createProject = useCallback(
    async (dto: CreateProjectDTO): Promise<Project | null> => {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            title: dto.title,
            description: dto.description ?? null,
            color: dto.color,
          } as never,
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const created = data as Project;
      setProjects((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------
  const updateProject = useCallback(
    async (id: string, dto: UpdateProjectDTO): Promise<void> => {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update({
          ...(dto.title       !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.color       !== undefined && { color: dto.color }),
        } as never)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updated = data as Project;
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    []
  );

  // ----------------------------------------------------------
  // Delete (tasks are cascade-deleted by the DB)
  // ----------------------------------------------------------
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
