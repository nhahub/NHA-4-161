import ScheduleTimeline from "../components/ScheduleTimeline";

export default function DailyScheduleView({ appointments, onComplete, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Daily Schedule</h1>
        <p className="text-sm text-muted-foreground">Live, chronological view of today's queue.</p>
      </div>
      <ScheduleTimeline appointments={appointments} onComplete={onComplete} onCancel={onCancel} />
    </div>
  );
}
