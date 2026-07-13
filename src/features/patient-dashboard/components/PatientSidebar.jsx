import { Building2, Calendar, LayoutDashboard, LogOut, Search } from "lucide-react";
import Logo from "../../../components/Logo";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "departments", label: "Departments", Icon: Building2 },
  { id: "doctors", label: "Find Doctors", Icon: Search },
  { id: "appointments", label: "My Appointments", Icon: Calendar },

];

export default function PatientSidebar({ activeView, onNavigate, isOpen, patientName, onSignOut }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOutClick() {
    if (typeof onSignOut === "function") {
      await onSignOut();
    } else {
      try {
        await logout();
      } catch (err) {
        console.error("[PatientSidebar] fallback logout failed:", err);
      }
      navigate("/login");
    }
  }

  return (
    <aside
      className={`shrink-0 overflow-hidden border-r border-border bg-muted/60 transition-all duration-200 ${
        isOpen ? "w-64" : "w-0 border-r-0"
      }`}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="border-b border-border p-5">
          <Logo compact subtitle="Patient Portal" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Navigation</p>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 mt-auto">
          <div className="mb-2 px-3 py-1.5 leading-tight">
            <p className="text-sm font-semibold text-foreground truncate">{patientName}</p>
            <p className="text-xs text-muted-foreground">Patient</p>
          </div>
          <button
            type="button"
            onClick={handleSignOutClick}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}