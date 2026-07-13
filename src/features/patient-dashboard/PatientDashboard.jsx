import { useState } from "react";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDarkMode from "../../hooks/useDarkMode";
import useDepartments from "../../hooks/useDepartments";
import useDoctors from "../../hooks/useDoctors";
import usePatientAppointments from "../../hooks/usePatientAppointments";
import DashboardHeader from "../../components/DashboardHeader";
import PatientSidebar from "./components/PatientSidebar";
import OverviewView from "./views/OverviewView";
import DepartmentsView from "./views/DepartmentsView";
import DoctorsView from "./views/DoctorsView";
import BookAppointmentView from "./views/BookAppointmentView";
import AppointmentsView from "./views/AppointmentsView";


export default function PatientDashboard({ patientId, patientName, onSignOut }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingDoctorId, setBookingDoctorId] = useState(null);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { message, title, variant, showToast, hideToast } = useToast();

  const { departments, loading: departmentsLoading } = useDepartments();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    bookAppointment,
    cancelAppointment,
  } = usePatientAppointments();

  function goToBooking(doctorId) {
    setBookingDoctorId(doctorId ?? null);
    setActiveView("book");
  }

  async function handleBook({ doctorId, departmentId, dateTime }) {
    try {
      await bookAppointment({ doctorId, departmentId, dateTime });
      showToast("Your appointment request has been sent.", { title: "Appointment booked", variant: "success" });
      setActiveView("appointments");
    } catch (err) {
      const raw = err.response?.data?.error;
      const msg = typeof raw === "object" ? raw?.message : raw;
      showToast(msg || "Could not book this appointment. Please try again.", { title: "Booking failed", variant: "error" });
    }
  }

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      showToast("Your appointment has been cancelled.", { title: "Appointment cancelled", variant: "info" });
    } catch (err) {
      const raw = err.response?.data?.error;
      const msg = typeof raw === "object" ? raw?.message : raw;
      showToast(msg || "Could not cancel this appointment.", { title: "Cancellation failed", variant: "error" });
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <PatientSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        patientName={patientName}
        onSignOut={onSignOut}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
          name={patientName}
          role="Patient"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeView === "dashboard" && (
            <OverviewView appointments={appointments} loading={appointmentsLoading} onNavigate={setActiveView} />
          )}

          {activeView === "departments" && (
            <DepartmentsView
              departments={departments}
              doctors={doctors}
              loading={departmentsLoading}
              onBrowseDoctors={() => setActiveView("doctors")}
            />
          )}

          {activeView === "doctors" && (
            <DoctorsView doctors={doctors} departments={departments} loading={doctorsLoading} onBook={goToBooking} />
          )}

          {activeView === "book" && (
            <BookAppointmentView
              doctors={doctors}
              departments={departments}
              initialDoctorId={bookingDoctorId}
              onSubmit={handleBook}
              onCancel={() => setActiveView("doctors")}
            />
          )}

          {activeView === "appointments" && (
            <AppointmentsView
              appointments={appointments}
              loading={appointmentsLoading}
              error={appointmentsError}
              onCancel={handleCancel}
              onBookNew={() => goToBooking(null)}
            />
          )}


        </main>
      </div>
    </div>
  );
}