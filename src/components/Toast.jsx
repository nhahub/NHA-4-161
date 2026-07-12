import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const VARIANTS = {
  error: { Icon: AlertCircle, iconWrap: "bg-red-100", iconColor: "text-red-600" },
  success: { Icon: CheckCircle2, iconWrap: "bg-emerald-100", iconColor: "text-emerald-600" },
  info: { Icon: Info, iconWrap: "bg-blue-100", iconColor: "text-blue-600" },
};

export default function Toast({ message, title = "Sign in failed", variant = "error", onClose }) {
  if (!message) return null;
  const { Icon, iconWrap, iconColor } = VARIANTS[variant] ?? VARIANTS.error;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-lg"
      >
        <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}