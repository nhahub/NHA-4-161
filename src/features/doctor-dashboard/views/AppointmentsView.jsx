import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";
import EmptyState from "../../../components/EmptyState";

function RowActions({ appointment, onComplete, onCancel }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isResolved = appointment.status === "completed" || appointment.status === "cancelled";

  if (isResolved) return null;

  return (
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
          onBlur={() => setConfirmingCancel(false)}
          onClick={() => {
            onCancel(appointment._id);
            setConfirmingCancel(false);
          }}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          Confirm?
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingCancel(true)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function AppointmentsView({ appointments, onComplete, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
        <p className="text-sm text-muted-foreground">All your appointments</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message="No appointments match this state criteria." />
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-foreground">{appointment.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.appointmentDate} · {appointment.timeSlot}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={appointment.status} />
                <RowActions appointment={appointment} onComplete={onComplete} onCancel={onCancel} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
