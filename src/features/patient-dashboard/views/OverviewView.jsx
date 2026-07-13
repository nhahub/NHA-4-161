import { Calendar, CalendarPlus, CheckCircle2, Clock } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import PatientAppointmentCard from "../components/PatientAppointmentCard";

export default function OverviewView({ appointments, loading, onNavigate }) {
  const upcoming = appointments.filter((a) => a.status === "scheduled");
  const completed = appointments.filter((a) => a.status === "attended").length;
  const nextAppt = [...upcoming].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];

  const stats = [
    {
      label: "Upcoming Visits",
      Icon: Calendar,
      value: String(upcoming.length),
      caption: upcoming.length === 1 ? "appointment scheduled" : "appointments scheduled",
    },
    {
      label: "Next Appointment",
      Icon: Clock,
      value: nextAppt
        ? new Date(nextAppt.dateTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "—",
      caption: nextAppt ? nextAppt.doctorId?.name ?? "Doctor TBD" : "Nothing scheduled",
    },
    { label: "Completed Visits", Icon: CheckCircle2, value: String(completed), caption: "Total attended" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">A snapshot of your care.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("doctors")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Book appointment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, Icon, value, caption }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="truncate text-xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Upcoming Appointments</h2>
          <button type="button" onClick={() => onNavigate("appointments")} className="text-sm font-medium text-primary hover:underline">
            View all
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <EmptyState message="No upcoming appointments yet. Book one to get started." />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((appt) => (
              <PatientAppointmentCard key={appt._id} appointment={appt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}