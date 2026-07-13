import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import DashboardHeader from "../../components/DashboardHeader";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDarkMode from "../../hooks/useDarkMode";
import ConfirmModal from "../../components/ConfirmModal";
import AppointmentModal from "./components/AppointmentModal";
import ReceptionistSidebar from "./components/ReceptionistSidebar";
import ReceptionOverviewView from "./views/ReceptionOverviewView";
import AppointmentsManageView from "./views/AppointmentsManageView";
import QueueManageView from "./views/QueueManageView";
import { receptionistApi } from "../../services/receptionistApi";

export default function ReceptionistDashboard({ receptionistId, receptionistName, onSignOut }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { message, title, variant, showToast, hideToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptData, docData] = await Promise.all([
        receptionistApi.getAppointments(),
        receptionistApi.getDoctors(),
      ]);
      setAppointments(apptData);
      setDoctors(docData);
    } catch (err) {
      showToast("Failed to load data", { title: "Error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitNewAppointment = async (formData) => {
    try {
      if (editingAppointment) {
        await receptionistApi.updateAppointment(editingAppointment._id, formData);
        showToast("Appointment updated", { title: "Success", variant: "success" });
      } else {
        await receptionistApi.createAppointment(formData);
        showToast("Appointment created", { title: "Success", variant: "success" });
      }
      setModalOpen(false);
      setEditingAppointment(null);
      fetchData();
    } catch (err) {
      showToast("Operation failed", { title: "Error", variant: "error" });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await receptionistApi.updateAppointmentStatus(id, status);
      showToast(`Appointment marked as ${status}`, { title: "Success", variant: "success" });
      fetchData();
    } catch (err) {
      showToast("Failed to update status", { title: "Error", variant: "error" });
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.dateTime && a.dateTime.slice(0, 10) === today);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <ReceptionistSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        receptionistName={receptionistName}
        onSignOut={onSignOut}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
          name={receptionistName}
          role="Receptionist"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
              Loading data...
            </div>
          ) : (
            <>
              {activeView === "dashboard" && (
                <ReceptionOverviewView 
                  appointments={todayAppointments} 
                  onUpdateStatus={handleUpdateStatus} 
                  onNewAppointment={() => setModalOpen(true)} 
                />
              )}
              {activeView === "appointments" && (
                <AppointmentsManageView 
                  appointments={appointments} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              )}
              {activeView === "queue" && (
                <QueueManageView 
                  appointments={appointments} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              )}
            </>
          )}
        </main>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleSubmitNewAppointment}
        appointment={editingAppointment}
        doctors={doctors}
      />
    </div>
  );
}
