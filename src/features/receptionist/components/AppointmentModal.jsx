import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText } from "lucide-react";

export default function AppointmentModal({ isOpen, onClose, onSubmit, appointment, doctors }) {
  const [formData, setFormData] = useState({
    patientName: "",
    doctorId: "",
    date: "",
    time: "",
    type: "regular",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName || "",
        doctorId: appointment.doctorId || "",
        date: appointment.date || "",
        time: appointment.time || "",
        type: appointment.type || "regular",
        notes: appointment.notes || "",
      });
    } else {
      setFormData({
        patientName: "",
        doctorId: "",
        date: "",
        time: "",
        type: "regular",
        notes: "",
      });
    }
    setErrors({});
  }, [appointment, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = "Required";
    if (!formData.doctorId) newErrors.doctorId = "Required";
    if (!formData.date) newErrors.date = "Required";
    if (!formData.time) newErrors.time = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const doctor = doctors.find((d) => d._id === formData.doctorId);
      onSubmit({
        ...formData,
        doctorName: doctor?.name || "",
        department: doctor?.department || "",
      });
    }
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
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-muted-foreground" /> Patient Name
              </label>
              <input
                type="text"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.patientName ? "border-destructive ring-1 ring-destructive/20" : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                }`}
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
              />
              {errors.patientName && <p className="mt-1 text-xs text-destructive">{errors.patientName}</p>}
            </div>



            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-muted-foreground" /> Doctor {/* Using User icon for simplicity */}
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
                    {doc.name} - {doc.department}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="mt-1 text-xs text-destructive">{errors.doctorId}</p>}
            </div>

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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
              <div className="flex gap-2">
                {["regular", "urgent", "follow-up"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-all ${
                      formData.type === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                    onClick={() => setFormData({ ...formData, type })}
                  >
                    {type.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

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
