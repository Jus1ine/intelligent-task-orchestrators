import { cn } from '../../lib/utils';

// ============================================================
// Spinner Component
// ============================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-slate-200 border-t-indigo-600 animate-spin',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
      role="status"
    />
  );
}

// ============================================================
// Full-page Loading Screen
// ============================================================

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 8h16M8 14h10M8 20h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Spinner size="sm" />
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded-lg', className)} />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
