import { Bone, Brain, Building2, HeartPulse, Microscope, Stethoscope } from "lucide-react";
import EmptyState from "../../../components/EmptyState";

const ICON_MAP = [
  { match: /cardio|heart/i, Icon: HeartPulse },
  { match: /derma|skin/i, Icon: Microscope },
  { match: /neuro|brain/i, Icon: Brain },
  { match: /ortho|bone/i, Icon: Bone },
];

function iconFor(name) {
  return ICON_MAP.find((entry) => entry.match.test(name))?.Icon ?? Stethoscope;
}

export default function DepartmentsView({ departments, doctors, loading, onBrowseDoctors }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments</h1>
        <p className="text-sm text-muted-foreground">Browse every care specialty available at MediCare.</p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : departments.length === 0 ? (
        <EmptyState message="No departments available yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const Icon = iconFor(dept.name);
            const doctorCount = doctors.filter((doc) => doc.departmentId === dept._id).length;

            return (
              <div key={dept._id} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {doctorCount} {doctorCount === 1 ? "doctor" : "doctors"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                <button
                  type="button"
                  onClick={onBrowseDoctors}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Browse doctors
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}