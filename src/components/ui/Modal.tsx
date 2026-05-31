import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================
// Modal Component
// ============================================================

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, size = 'md', children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      // z-[1200] ensures the modal sits above the sticky header (z-index: 1000)
      // and all dropdown/card layers.
      // Desktop: centered with p-4 padding
      // Mobile (max-md): bottom-sheet — aligned to bottom, no horizontal padding
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 max-md:items-end max-md:p-0"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" />

      {/* Panel
          Desktop: centered card with rounded corners, constrained by sizeClasses
          Mobile:  full-width bottom sheet, rounded only at top, 90dvh max height  */}
      <div
        className={cn(
          // ── Base (desktop) ──
          'relative z-10 w-full bg-white rounded-2xl shadow-2xl shadow-slate-900/10',
          'animate-zoom-in',
          'border border-slate-100',
          sizeClasses[size],
          // ── Mobile overrides ──
          // Full width, flat bottom, rounded top, 90dvh height cap
          'max-md:max-w-full max-md:rounded-b-none max-md:rounded-t-2xl',
          'max-md:flex max-md:flex-col max-md:max-h-[90dvh]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Drag handle pill — mobile only */}
        <div className="hidden max-md:flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4 max-md:p-4 max-md:pb-3 flex-shrink-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content — scrolls internally on mobile when content is taller than available space */}
        <div className={cn(
          // Desktop padding
          'px-6',
          !title && !description ? 'pt-6' : '',
          !footer ? 'pb-6' : '',
          // Mobile: reduced padding, flex-1 fills remaining height, scrollable
          'max-md:px-4 max-md:overflow-y-auto max-md:flex-1 max-md:min-h-0',
          !title && !description ? 'max-md:pt-4' : '',
          !footer ? 'max-md:pb-6' : '',
        )}>
          {children}
        </div>

        {/* Footer — always visible, never scrolls away */}
        {footer && (
          <div className="px-6 pb-6 pt-4 max-md:px-4 max-md:pb-6 max-md:pt-3 flex items-center justify-end gap-3 border-t border-slate-100 mt-4 max-md:mt-0 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
