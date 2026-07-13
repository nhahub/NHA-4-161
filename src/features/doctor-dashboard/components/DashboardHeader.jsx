import { Menu, Moon, Sun } from "lucide-react";

export default function DashboardHeader({ onToggleSidebar, isDark, onToggleDarkMode, name, role }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          {role && <p className="text-xs text-muted-foreground">{role}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleDarkMode}
        aria-label="Toggle dark mode"
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
