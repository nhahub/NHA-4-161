import { useState } from "react";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDarkMode from "../../hooks/useDarkMode";
import useAppointments from "../../hooks/useAppointments";
import useBlockTimes from "../../hooks/useBlockTimes";
import { todayISODate } from "../../utils/storage";
import { seedDemoScheduleIfEmpty } from "./seedDemoSchedule";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardView from "./views/DashboardView";
import DailyScheduleView from "./views/DailyScheduleView";
import AppointmentsView from "./views/AppointmentsView";
import BlockTimeView from "./views/BlockTimeView";

export default function DoctorDashboard({ doctorId, doctorName }) {
  // Runs synchronously during render, before useAppointments/useBlockTimes
  // read localStorage below — so their very first read already sees the
  // seeded data. It's idempotent (see seedDemoSchedule.js), so re-renders
  // are a cheap no-op once today's data exists.
  seedDemoScheduleIfEmpty(doctorId, doctorName);

  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { message, title, variant, showToast, hideToast } = useToast();
  const today = todayISODate();

  const { appointments, updateStatus } = useAppointments(doctorId, today);
  const { blocks, addBlock, removeBlock } = useBlockTimes(doctorId);

  const handleComplete = (id) => {
    updateStatus(id, "completed");
    showToast("The queue counter has been updated.", {
      title: "Consultation marked as completed",
      variant: "success",
    });
  };

  const handleCancel = (id) => {
    updateStatus(id, "cancelled");
    showToast("The patient's slot has been freed up.", {
      title: "Appointment cancelled",
      variant: "error",
    });
  };

  const handleAddBlock = (block) => {
    addBlock(block);
    showToast(`${block.date} · ${block.startTime}–${block.endTime} is now unavailable for booking.`, {
      title: "Time slot locked",
      variant: "info",
    });
  };

  // No real auth flow exists yet — this drops the temporary ?dashboard=1
  // preview param and sends the doctor back to the sign-in page. Replace
  // with the real sign-out call once auth is wired up.
  const handleSignOut = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <DashboardSidebar activeView={activeView} onNavigate={setActiveView} isOpen={sidebarOpen} />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
          doctorName={doctorName}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeView === "dashboard" && (
            <DashboardView
              appointments={appointments}
              blocks={blocks}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          )}

          {activeView === "schedule" && (
            <DailyScheduleView appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} />
          )}

          {activeView === "appointments" && (
            <AppointmentsView appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} />
          )}

          {activeView === "blocktime" && (
            <BlockTimeView blocks={blocks} onAddBlock={handleAddBlock} onRemoveBlock={removeBlock} />
          )}
        </main>
      </div>
    </div>
  );
}
