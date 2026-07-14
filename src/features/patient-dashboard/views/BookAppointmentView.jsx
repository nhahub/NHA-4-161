import { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, Clock3, Stethoscope } from "lucide-react";
import api from "../../../services/api";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookAppointmentView({ doctors, departments, initialDoctorId, onSubmit, onCancel }) {
  const bookableDoctors = useMemo(() => doctors.filter((d) => d.departmentId), [doctors]);

  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || bookableDoctors[0]?._id || "");
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDoctorId && bookableDoctors[0]) setSelectedDoctorId(bookableDoctors[0]._id);
  }, [bookableDoctors, selectedDoctorId]);

  // Fetch availability whenever doctor or date changes
  const fetchSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/appointments/availability?doctorId=${doctorId}&date=${date}`);
      setSlots(res.data.slots ?? []);
    } catch (err) {
      console.error("Failed to fetch availability slots:", err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(selectedDoctorId, selectedDate);
  }, [selectedDoctorId, selectedDate, fetchSlots]);

  const doctor = bookableDoctors.find((d) => d._id === selectedDoctorId);
  const departmentName = (id) => departments.find((d) => d._id === id)?.name ?? "General";

  const dateOptions = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return {
        label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString(undefined, { weekday: "short" }),
        value: formatDateKey(date),
        short: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
    });
  }, []);

  async function handleConfirm() {
    if (!doctor || !selectedSlot) return;
    setSubmitting(true);
    // selectedSlot is already a full ISO string from the API
    try {
      await onSubmit({ doctorId: doctor._id, departmentId: doctor.departmentId, dateTime: selectedSlot });
    } finally {
      setSubmitting(false);
    }
  }

  // Display helper: slot is an ISO string, show HH:MM
  const fmtSlot = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (bookableDoctors.length === 0) {
    return <p className="text-sm text-muted-foreground">No doctors available to book right now.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Book Appointment</h1>
        <p className="text-sm text-muted-foreground">Choose a doctor, a day, and a time that fits your schedule.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="h-4 w-4" /> Choose a doctor
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {bookableDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc._id;
                return (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc._id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="font-semibold text-foreground">{doc.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{departmentName(doc.departmentId)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-4 w-4" /> Pick a day
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {dateOptions.map((option) => {
                const isSelected = selectedDate === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDate(option.value)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      isSelected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background text-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{option.short}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock3 className="h-4 w-4" /> Available time slots
            </div>
            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this day.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        isSelected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background text-foreground hover:border-muted-foreground/40"
                      }`}
                    >
                      {fmtSlot(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-foreground p-5 text-background shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-background/70">Booking summary</p>
          <h3 className="mt-3 text-xl font-semibold">{doctor?.name ?? "—"}</h3>
          <p className="mt-1 text-sm text-background/70">{doctor ? departmentName(doctor.departmentId) : ""}</p>

          <div className="mt-6 space-y-3 rounded-xl border border-background/10 bg-background/10 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-background/70">Day</span>
              <span className="font-semibold">{dateOptions.find((o) => o.value === selectedDate)?.label ?? selectedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-background/70">Time</span>
              <span className="font-semibold">{selectedSlot ? fmtSlot(selectedSlot) : "—"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !doctor || !selectedSlot}
            className="mt-6 w-full rounded-xl bg-background px-4 py-3 font-semibold text-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
          <button type="button" onClick={onCancel} className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-medium text-background/70 hover:text-background">
            Cancel
          </button>
        </aside>
      </div>
    </div>
  );
}
