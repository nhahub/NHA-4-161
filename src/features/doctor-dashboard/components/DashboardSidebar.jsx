import { Ban, Calendar, Clock, LayoutDashboard } from "lucide-react";
import Logo from "../../../components/Logo";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "schedule", label: "Daily Schedule", Icon: Clock },
  { id: "appointments", label: "Appointments", Icon: Calendar },
  { id: "blocktime", label: "Block Time", Icon: Ban },
];

export default function DashboardSidebar({ activeView, onNavigate, isOpen }) {
  return (
    <aside
      className={`shrink-0 overflow-hidden border-r border-border bg-muted/60 transition-all duration-200 ${
        isOpen ? "w-64" : "w-0 border-r-0"
      }`}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="border-b border-border p-5">
          <Logo compact subtitle="Doctor Portal" />
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
      </div>
    </aside>
  );
}
