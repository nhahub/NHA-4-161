import { Calendar, Clock, CheckCircle } from "lucide-react";

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ReceptionOverviewView({ appointments, onUpdateStatus, onNewAppointment }) {
  const total = appointments.length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const attended = appointments.filter((a) => a.status === "attended").length;

  const renderStatus = (apt) => {
    switch (apt.status) {
      case "scheduled":
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Scheduled</span>;
      case "attended":
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Attended</span>;
      case "no-show":
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-400">No-show</span>;
      case "cancelled":
        return <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">Cancelled</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">{apt.status}</span>;
    }
  };

  const renderAction = (apt) => {
    if (apt.status === "scheduled") {
      return (
        <button
          onClick={() => onUpdateStatus(apt._id, "attended")}
          className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
        >
          Mark Attended
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reception Dashboard</h2>
          <p className="text-sm text-muted-foreground">Today's appointments and queue</p>
        </div>
        <button
          onClick={onNewAppointment}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          New Appointment
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Today Total</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="mt-2 text-2xl font-bold">{total}</h3>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Scheduled</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="mt-2 text-2xl font-bold">{scheduled}</h3>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Attended</p>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="mt-2 text-2xl font-bold">{attended}</h3>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">Today's Queue</h3>
          <p className="text-sm text-muted-foreground">All appointments for today</p>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No appointments today.</p>
          ) : (
            appointments.map((apt, index) => (
              <div key={apt._id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.patientId?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Dr. {apt.doctorId?.name ?? "—"} • {fmtTime(apt.dateTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatus(apt)}
                  {renderAction(apt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
