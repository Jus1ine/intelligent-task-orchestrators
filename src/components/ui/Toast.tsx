import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ToastMessage } from '../../types';

// ============================================================
// Toast Item
// ============================================================

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-500',
    textColor: 'text-rose-800',
  },
  info: {
    icon: Info,
    bg: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-500',
    textColor: 'text-indigo-800',
  },
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-slate-900/5',
        'animate-slide-up',
        'max-w-sm w-full',
        config.bg
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
      <p className={cn('text-sm font-medium flex-1', config.textColor)}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X size={14} className={config.textColor} />
      </button>
    </div>
  );
}

// ============================================================
// Toast Container
// ============================================================

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
