import React from 'react';
import { cn } from '../../lib/utils';
import type { Priority, Status } from '../../types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../lib/utils';

// ============================================================
// Generic Badge
// ============================================================

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
  dot?: string;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  children, color = 'text-slate-600', bg = 'bg-slate-100',
  border = 'border-slate-200', dot, showDot = false, className, size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        color, bg, border, className
      )}
    >
      {showDot && dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
      {children}
    </span>
  );
}

// ============================================================
// Priority Badge
// ============================================================

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge
      color={config.color}
      bg={config.bg}
      border={config.border}
      dot={config.dot}
      showDot
    >
      {config.label}
    </Badge>
  );
}

// ============================================================
// Status Badge
// ============================================================

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      color={config.color}
      bg={config.bg}
      border={config.border}
      dot={config.dot}
      showDot
    >
      {config.label}
    </Badge>
  );
}

// ============================================================
// Count Badge
// ============================================================

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
        'text-xs font-semibold rounded-full',
        className
      )}
    >
      {count}
    </span>
  );
}
