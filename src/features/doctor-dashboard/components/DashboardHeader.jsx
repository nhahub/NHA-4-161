import { LogOut, Moon, PanelLeft, Sun } from "lucide-react";

export default function DashboardHeader({
  onToggleSidebar,
  isDark,
  onToggleDarkMode,
  doctorName,
  role = "Doctor",
  onSignOut,
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-semibold text-foreground">{doctorName}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
