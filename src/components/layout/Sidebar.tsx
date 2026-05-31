import React, { useState } from 'react';
import { Plus, Folder, Trash2, ChevronRight, LayoutGrid, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Project } from '../../types';
import { Button } from '../ui/Button';

// ============================================================
// Sidebar Component
// ============================================================

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (project: Project) => void;
  loading?: boolean;
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onEditProject,
  loading = false,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteProject(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-white border-r border-slate-100 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
          <LayoutGrid size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">Orchestrator</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Task Management</p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Projects
        </span>
        <button
          onClick={onNewProject}
          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="New project"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Project List */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {loading && (
          <div className="space-y-1 px-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
            <Folder size={24} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">No projects yet</p>
            <button
              onClick={onNewProject}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create one
            </button>
          </div>
        )}

        {!loading &&
          projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const isHovered = hoveredId === project.id;
            const isConfirming = confirmDeleteId === project.id;

            return (
              <div
                key={project.id}
                className={cn(
                  'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer',
                  'transition-all duration-150',
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
                onClick={() => onSelectProject(project.id)}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Color dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />

                {/* Title */}
                <span className="flex-1 text-sm font-medium truncate">{project.title}</span>

                {/* Actions */}
                {(isHovered || isSelected) && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
                      title="Edit project"
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className={cn(
                        'p-1 rounded-md transition-colors text-xs',
                        isConfirming
                          ? 'text-rose-600 bg-rose-50 font-medium px-1.5'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                      )}
                      title={isConfirming ? 'Click again to confirm delete' : 'Delete project'}
                    >
                      {isConfirming ? '!' : <Trash2 size={12} />}
                    </button>
                  </div>
                )}

                {isSelected && !isHovered && (
                  <ChevronRight size={14} className="text-indigo-400 shrink-0" />
                )}
              </div>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          icon={<Plus size={14} />}
          onClick={onNewProject}
        >
          New Project
        </Button>
      </div>
    </aside>
  );
}
