import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Shared modal shell with consistent layering and scroll lock.
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size]
 * @param {number} [props.zIndex] — use 200 for AI settings so it stacks above feature modals (100).
 */
export default function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'md',
  zIndex = 100,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[min(96vw,72rem)]',
  }[size] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={`relative flex w-full flex-col bg-white shadow-2xl sm:rounded-2xl max-h-[96dvh] sm:max-h-[90vh] ${sizeClass}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <h2 id="modal-title" className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
            {icon}
            <span className="truncate">{title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
