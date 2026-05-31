import { LayoutGrid, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================
// Empty State Component
// ============================================================

interface EmptyStateProps {
  type?: 'board' | 'projects' | 'search';
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const icons = {
  board: (
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <LayoutGrid size={28} className="text-slate-400" />
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-500 text-xs font-bold">0</span>
      </div>
    </div>
  ),
  projects: (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <Inbox size={28} className="text-slate-400" />
    </div>
  ),
  search: (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#94A3B8" strokeWidth="2" />
        <path d="M16.5 16.5L21 21" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 9h4M9 12h2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  ),
};

export function EmptyState({ type = 'board', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      <div className="mb-5">{icons[type]}</div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}

// ============================================================
// Column Empty Drop Zone
// ============================================================

export function ColumnEmptyState({ isDragOver }: { isDragOver: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 px-4 rounded-xl border-2 border-dashed',
        'transition-all duration-200',
        isDragOver
          ? 'border-indigo-400 bg-indigo-50/60'
          : 'border-slate-200 bg-slate-50/40'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
        isDragOver ? 'bg-indigo-100' : 'bg-slate-100'
      )}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={isDragOver ? '#6366f1' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className={cn(
        'text-xs font-medium',
        isDragOver ? 'text-indigo-600' : 'text-slate-400'
      )}>
        {isDragOver ? 'Drop task here' : 'No tasks yet'}
      </p>
    </div>
  );
}
