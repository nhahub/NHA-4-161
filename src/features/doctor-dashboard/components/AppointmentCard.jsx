import { useState } from "react";
import { CheckCircle2, Footprints, Globe, Phone, User } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";

const TYPE_ICON = {
  "Walk-in": Footprints,
  Phone: Phone,
  Online: Globe,
};

export default function AppointmentCard({ appointment, onComplete, onCancel }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const TypeIcon = TYPE_ICON[appointment.type] ?? User;
  const isResolved = appointment.status === "completed" || appointment.status === "cancelled";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium leading-none text-foreground">{appointment.patientName}</p>
              <span className="text-xs text-muted-foreground">Queue #{appointment.queueNumber}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5">
                <TypeIcon className="h-3 w-3" />
                {appointment.type}
              </span>
              <span>{appointment.timeSlot}</span>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.complaint}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={appointment.status} />

          {!isResolved && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onComplete(appointment._id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </button>

              {confirmingCancel ? (
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    onCancel(appointment._id);
                    setConfirmingCancel(false);
                  }}
                  onBlur={() => setConfirmingCancel(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  Confirm?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
