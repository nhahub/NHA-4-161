import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import EmptyState from "../../../components/EmptyState";

export default function DoctorsView({ doctors, departments, loading, onBook }) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const departmentName = (id) => departments.find((d) => d._id === id)?.name ?? "General";

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = `${doc.name} ${departmentName(doc.departmentId)}`.toLowerCase().includes(search.toLowerCase());
      const matchesDept = !departmentFilter || doc.departmentId === departmentFilter;
      return matchesSearch && matchesDept;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, departments, search, departmentFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Find a Doctor</h1>
        <p className="text-sm text-muted-foreground">Search and book an appointment.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="min-w-[180px] rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState message="No doctors match your search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <div key={doc._id} className="flex flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground">{doc.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">{departmentName(doc.departmentId)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBook(doc._id)}
                disabled={!doc.departmentId}
                className="mt-auto w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {doc.departmentId ? "Book Appointment" : "Not yet assigned to a department"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}