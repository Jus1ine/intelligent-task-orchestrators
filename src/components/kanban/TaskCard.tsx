import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Status badge
  const statusLabel = task.archived ? 'Done' : task.completed ? 'In Progress' : 'To Do';
  const statusClass = task.archived ? 'done' : task.completed ? 'in-progress' : 'todo';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {/* ── Top bar: drag handle + explicit actions ── */}
      <div className="task-card-topbar">
        {/* Drag handle */}
        <div className="drag-handle" {...attributes} {...listeners}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="6" r="1.5"/>
            <circle cx="15" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/>
            <circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="task-card-content">
        <h3 className="task-card-title" title={task.text}>
          {task.text}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="task-card-description">{task.description}</p>
        )}

        {/* Category badge */}
        {(task as any).category && (
          <span className="task-card-category">{(task as any).category}</span>
        )}

        <div className="task-card-meta">
          <span className={`task-status ${statusClass}`}>{statusLabel}</span>
        </div>

        {/* Removed subtasks logic for simplicity since the AI feature replaces the old manual list UI,
            but keeping the date at the bottom. */}
        <div className="task-card-footer mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="task-card-date">{formatDate(task.created_at)}</span>
          <div className="flex gap-2">
            <button
              className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 rounded shadow-sm"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            >
              Edit
            </button>
            <button
              className="text-xs font-medium text-slate-600 hover:text-red-600 transition-colors px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded shadow-sm"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
