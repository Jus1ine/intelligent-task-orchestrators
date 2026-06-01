import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Plus, Info } from 'lucide-react';

import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import type { Task } from './types';

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'orchestrator-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Components
import { Header } from './components/layout/Header';
import { TaskList } from './components/kanban/TaskList';
import { ToastContainer } from './components/ui/Toast';
import { Button } from './components/ui/Button';

// Modals
import { ProjectForm } from './components/projects/ProjectForm';
import { TaskModal } from './components/tasks/TaskModal';
import { DeleteConfirmModal } from './components/tasks/DeleteConfirmModal';
import { MagicGuideModal } from './components/tasks/MagicGuideModal';

// ============================================================
// Tab constants
// ============================================================
const TABS = {
  ALL: 'all',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

// ============================================================
// App
// ============================================================
function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  // ── Projects ──────────────────────────────────────────────
  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // ── Tasks ─────────────────────────────────────────────────
  const {
    tasks,
    loading: tasksLoading,
    updateTask,
    deleteTask,
    toggleComplete,
    archiveTask,
    unarchiveTask,
    reorderTasks,
    bulkCreateTasks,
  } = useTasks(selectedProjectId);

  // ── UI State ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // ── Modal state ───────────────────────────────────────────
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  // ── Toast ─────────────────────────────────────────────────
  const { toasts, addToast, removeToast } = useToast();

  // ── DnD Sensors ───────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ============================================================
  // Task Handlers
  // ============================================================


  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      addToast('Task updated successfully', 'success');
    } catch (err: any) {
      throw err; 
    }
  };

  const handleBulkCreateTasks = async (newTasks: Partial<Task>[]) => {
    try {
      await bulkCreateTasks(newTasks as any);
      addToast(`✨ Successfully created ${newTasks.length} tasks!`, 'success');
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      addToast('Task deleted', 'success');
    } catch (err: any) {
      addToast(`Failed to delete task: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    toggleComplete(id, completed).catch((err) => {
      addToast(`Failed to update status: ${err.message}`, 'error');
    });
  };

  const handleArchive = (id: string) => {
    archiveTask(id).catch((err) => {
      addToast(`Failed to move task to Done: ${err.message}`, 'error');
    });
  };

  const handleUnarchive = (id: string) => {
    unarchiveTask(id).catch((err) => {
      addToast(`Failed to restore task: ${err.message}`, 'error');
    });
  };

  const openCreateModal = () => {
    setTaskModalMode('create');
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setTaskModalMode('edit');
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  // ============================================================
  // Drag and Drop
  // ============================================================

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === (event.active.id as string));
    if (task) setDraggedTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const tabIds = [TABS.DONE, TABS.TODO, TABS.IN_PROGRESS, TABS.ALL];
    if (tabIds.includes(overId)) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (overId === TABS.DONE) {
        if (!task.archived) handleArchive(taskId);
        return;
      }

      if (task.archived) {
        handleUnarchive(taskId);
        if (overId === TABS.IN_PROGRESS && !task.completed) {
          handleToggleComplete(taskId, true);
        } else if (overId === TABS.TODO && task.completed) {
          handleToggleComplete(taskId, false);
        }
        return;
      }

      if (overId === TABS.IN_PROGRESS && !task.completed) {
        handleToggleComplete(taskId, true);
      } else if (overId === TABS.TODO && task.completed) {
        handleToggleComplete(taskId, false);
      }
    } else {
      reorderTasks(taskId, overId).catch((err) => {
        addToast(`Failed to reorder: ${err.message}`, 'error');
      });
    }
  };

  // ============================================================
  // Filters & Counts
  // ============================================================

  const taskCounts = {
    all:        tasks.filter((t) => !t.archived).length,
    todo:       tasks.filter((t) => !t.completed && !t.archived).length,
    inProgress: tasks.filter((t) =>  t.completed && !t.archived).length,
    done:       tasks.filter((t) =>  t.archived).length,
  };

  const getFilteredTasks = (): Task[] => {
    switch (activeTab) {
      case TABS.IN_PROGRESS: return tasks.filter((t) =>  t.completed && !t.archived);
      case TABS.TODO:        return tasks.filter((t) => !t.completed && !t.archived);
      case TABS.DONE:        return tasks.filter((t) =>  t.archived);
      default:               return tasks.filter((t) => !t.archived);
    }
  };

  const activeTasksList = getFilteredTasks();

  // Task being deleted (for modal title)
  const deletingTask = tasks.find((t) => t.id === deletingTaskId) ?? null;

  // ============================================================
  // Render
  // ============================================================

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app-container">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <Header
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProjectId}
          onCreateProject={() => setProjectFormOpen(true)}
          onEditProject={() => setProjectFormOpen(true)}
          onDeleteProject={async (id) => {
            try {
              await deleteProject(id);
              if (selectedProjectId === id) setSelectedProjectId(null);
              addToast('Project deleted', 'success');
            } catch (err: any) {
              addToast(`Failed to delete project: ${err.message}`, 'error');
            }
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          taskCounts={taskCounts}
          tabs={TABS}
          themeMode={themeMode}
          onToggleThemeMode={toggleThemeMode}
        />

        <main className="app-main">
          {projectsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading your projects...</p>
            </div>
          ) : selectedProjectId ? (
            <>
              {/* Add Task Control */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">Tasks</h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" icon={<Info size={16} />} onClick={() => setGuideOpen(true)}>
                    AI Guide
                  </Button>
                  <Button variant="primary" icon={<Plus size={16} />} onClick={openCreateModal}>
                    Add Task
                  </Button>
                </div>
              </div>

              <TaskList
                tasks={activeTasksList}
                isLoading={tasksLoading}
                onEdit={openEditModal}
                onDelete={(id) => setDeletingTaskId(id)}
                emptyMessage={
                  activeTab === TABS.DONE        ? 'No done tasks yet. Drag a card here.' :
                  activeTab === TABS.IN_PROGRESS ? 'No tasks in progress yet.' :
                  activeTab === TABS.TODO        ? 'Nothing to do yet. Add a task above!' :
                  'No tasks yet. Add one above!'
                }
              />
            </>
          ) : (
            <div className="empty-project-state">
              <div className="empty-project-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2 className="empty-project-title">No Project Selected</h2>
              <p className="empty-project-desc">
                Create a new project or select an existing one to start managing your tasks.
              </p>
              <button
                onClick={() => setProjectFormOpen(true)}
                className="empty-project-btn"
              >
                Create Project
              </button>
            </div>
          )}
        </main>

        <footer className="footer">
          <div className="footer-bottom">
            <div className="footer-bottom-container">
              <span className="copyright-text">© 2026 Intelligent Task Orchestrator. All rights reserved.</span>
            </div>
          </div>
        </footer>

        <DragOverlay>
          {draggedTask && (
            <div className="drag-overlay-task">
              <span className="drag-overlay-text">{draggedTask.text}</span>
            </div>
          )}
        </DragOverlay>

        {/* ── Modals ─────────────────────────────────────── */}
        <ProjectForm
          open={projectFormOpen}
          onClose={() => setProjectFormOpen(false)}
          onSubmit={async (data: any) => {
            try {
              await createProject(data);
              setProjectFormOpen(false);
              addToast('Project created successfully', 'success');
            } catch (err: any) {
              addToast(`Failed to save project: ${err.message}`, 'error');
            }
          }}
        />

        <TaskModal
          open={taskModalOpen}
          mode={taskModalMode}
          task={editingTask}
          projectTitle={selectedProject?.title}
          projectDescription={selectedProject?.description}
          onClose={() => setTaskModalOpen(false)}
          onCreate={async (data) => {
            // we use bulk create for single as well because it respects all properties easily
            await handleBulkCreateTasks([data]); 
          }}
          onUpdate={handleUpdateTask}
          onBulkCreate={handleBulkCreateTasks}
          onError={(msg) => addToast(msg, 'error')}
        />

        <DeleteConfirmModal
          open={deletingTaskId !== null}
          taskTitle={deletingTask?.text ?? ''}
          onClose={() => setDeletingTaskId(null)}
          onConfirm={() => handleDeleteTask(deletingTaskId!)}
        />
        
        <MagicGuideModal 
          open={guideOpen} 
          onClose={() => setGuideOpen(false)} 
        />
      </div>
    </DndContext>
  );
}

export default App;
