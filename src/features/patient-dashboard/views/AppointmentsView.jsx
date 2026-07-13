import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import PatientAppointmentCard from "../components/PatientAppointmentCard";

const UPCOMING_STATUSES = ["scheduled"];
const PAST_STATUSES = ["attended", "cancelled", "no-show"];

export default function AppointmentsView({ appointments, loading, error, onCancel, onBookNew }) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcoming = appointments.filter((a) => UPCOMING_STATUSES.includes(a.status));
  const past = appointments.filter((a) => PAST_STATUSES.includes(a.status));
  const visible = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
          <p className="text-sm text-muted-foreground">View and manage your appointments.</p>
        </div>
        <button
          type="button"
          onClick={onBookNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Book appointment
        </button>
      </div>

      <div className="inline-flex rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "upcoming" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("past")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "past" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="py-8 text-center text-sm text-destructive">{error}</p>
      ) : visible.length === 0 ? (
        <EmptyState message={activeTab === "upcoming" ? "No upcoming appointments." : "No past appointments yet."} />
      ) : (
        <div className="space-y-3">
          {visible.map((appt) => (
            <PatientAppointmentCard key={appt._id} appointment={appt} onCancel={activeTab === "upcoming" ? onCancel : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}