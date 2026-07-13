import { useState } from "react";
import { Building2, Calendar, User } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";

export default function PatientAppointmentCard({ appointment, onCancel }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isResolved = ["attended", "cancelled", "no-show"].includes(appointment.status);

  const dateObj = new Date(appointment.dateTime);
  const dateLabel = dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium leading-none text-foreground">{appointment.doctorId?.name ?? "Doctor"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5">
                <Building2 className="h-3 w-3" />
                {appointment.departmentId?.name ?? "General"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateLabel} · {timeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={appointment.status} />

          {!isResolved && onCancel && (
            confirmingCancel ? (
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
                Confirm cancel?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                Cancel
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}