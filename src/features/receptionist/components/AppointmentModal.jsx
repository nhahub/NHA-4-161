import { useState, useEffect } from "react";
import { X, Calendar, Clock, User } from "lucide-react";
import api from "../../../services/api";

export default function AppointmentModal({ isOpen, onClose, onSubmit, appointment, doctors }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch patient list for the dropdown
  useEffect(() => {
    if (!isOpen) return;
    api.get("/staff?role=patient&limit=200").then((res) => {
      setPatients(res.data.users ?? []);
    }).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      const dt = appointment.dateTime ? new Date(appointment.dateTime) : null;
      setFormData({
        patientId: appointment.patientId?._id ?? appointment.patientId ?? "",
        doctorId: appointment.doctorId?._id ?? appointment.doctorId ?? "",
        date: dt ? dt.toISOString().split("T")[0] : "",
        time: dt ? dt.toTimeString().slice(0, 5) : "",
        notes: appointment.notes ?? "",
      });
    } else {
      setFormData({ patientId: "", doctorId: "", date: "", time: "", notes: "" });
    }
    setErrors({});
  }, [appointment, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = "Required";
    if (!formData.doctorId) newErrors.doctorId = "Required";
    if (!formData.date) newErrors.date = "Required";
    if (!formData.time) newErrors.time = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const dateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
    onSubmit({ patientId: formData.patientId, doctorId: formData.doctorId, dateTime, notes: formData.notes });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl border border-border animate-card-entrance">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {appointment ? "Edit Appointment" : "New Appointment"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-muted-foreground" /> Patient
              </label>
              <select
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.patientId ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                }`}
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                <option value="">Select a patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              {errors.patientId && <p className="mt-1 text-xs text-destructive">{errors.patientId}</p>}
            </div>

            {/* Doctor */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-muted-foreground" /> Doctor
              </label>
              <select
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.doctorId ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                }`}
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.departmentId?.name ?? ""}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="mt-1 text-xs text-destructive">{errors.doctorId}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Date
                </label>
                <input
                  type="date"
                  className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all ${
                    errors.date ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Time
                </label>
                <input
                  type="time"
                  className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all ${
                    errors.time ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
                {errors.time && <p className="mt-1 text-xs text-destructive">{errors.time}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
              <textarea
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                {appointment ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
