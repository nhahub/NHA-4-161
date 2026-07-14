import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDarkMode from "../../hooks/useDarkMode";
import useDoctorAppointments from "../../hooks/useDoctorAppointments";
import useBlockTimes from "../../hooks/useBlockTimes";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardView from "./views/DashboardView";
import DailyScheduleView from "./views/DailyScheduleView";
import AppointmentsView from "./views/AppointmentsView";
import BlockTimeView from "./views/BlockTimeView";

export default function DoctorDashboard({ doctorId, doctorName, onSignOut }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { message, title, variant, showToast, hideToast } = useToast();

  // Real backend — scoped to this doctor automatically by the API
  const { appointments, todayAppointments, loading, updateStatus } = useDoctorAppointments();
  // Block times have no backend yet — kept in localStorage
  const { blocks, addBlock, removeBlock } = useBlockTimes(doctorId);

  const handleComplete = async (id) => {
    await updateStatus(id, "attended");
    showToast("The queue counter has been updated.", {
      title: "Consultation marked as attended",
      variant: "success",
    });
  };

  const handleCancel = async (id) => {
    await updateStatus(id, "cancelled");
    showToast("The patient's slot has been freed up.", {
      title: "Appointment cancelled",
      variant: "error",
    });
  };

  const handleAddBlock = async (block) => {
    try {
      await addBlock(block);
      showToast(`${block.date} · ${block.startTime}–${block.endTime} is now unavailable for booking.`, {
        title: "Time slot locked",
        variant: "success",
      });
    } catch (err) {
      const raw = err.response?.data?.error;
      const msg = typeof raw === "object" ? raw?.message : raw;
      showToast(msg || "Failed to lock time slot.", {
        title: "Error",
        variant: "error",
      });
    }
  };

  const handleRemoveBlock = async (id) => {
    try {
      await removeBlock(id);
      showToast("The time block has been removed.", {
        title: "Block removed",
        variant: "success",
      });
    } catch (err) {
      const raw = err.response?.data?.error;
      const msg = typeof raw === "object" ? raw?.message : raw;
      showToast(msg || "Failed to remove time block.", {
        title: "Error",
        variant: "error",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <DashboardSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        doctorName={doctorName}
        onSignOut={onSignOut}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
          name={doctorName}
          role="Doctor"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
              Loading appointments…
            </div>
          ) : (
            <>
              {activeView === "dashboard" && (
                <DashboardView
                  appointments={todayAppointments}
                  blocks={blocks}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              )}

              {activeView === "schedule" && (
                <DailyScheduleView
                  appointments={todayAppointments}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              )}

              {activeView === "appointments" && (
                <AppointmentsView
                  appointments={appointments}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              )}

              {activeView === "blocktime" && (
                <BlockTimeView blocks={blocks} onAddBlock={handleAddBlock} onRemoveBlock={handleRemoveBlock} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}