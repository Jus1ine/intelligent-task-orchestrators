import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  isLoading,
  emptyMessage,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="task-list-loading">
        <span>Loading…</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>{emptyMessage || 'No tasks here. Add one above.'}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
