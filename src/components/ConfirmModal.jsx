import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Generic blocking confirmation / error modal.
 * Props:
 *   title       – dialog heading
 *   message     – body text
 *   detail      – optional secondary detail (ACTIVE_DEPENDENCIES_EXIST explanation)
 *   confirmLabel – label for the confirm button (default "Confirm")
 *   onConfirm   – called when confirm is clicked (omit to show info-only dialog)
 *   onClose     – called when Cancel / X is clicked
 *   danger      – if true, confirm button is red
 */
export default function ConfirmModal({
  title,
  message,
  detail,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
  danger = false,
}) {
  const cancelRef = useRef(null);

  // Trap focus + ESC close
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-foreground">{message}</p>
        {detail && (
          <p className="mt-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2 text-sm text-warning">{detail}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            {onConfirm ? 'Cancel' : 'Close'}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                danger ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
