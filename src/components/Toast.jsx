import { AlertCircle, X } from "lucide-react";

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-lg"
      >
        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-3.5 w-3.5 text-red-600" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Sign in failed</p>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}