import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';
import Logo from '../../components/Logo';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  LogOut,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/dashboard/staff',       label: 'Users',       icon: Users,           end: false },
  { to: '/dashboard/departments', label: 'Departments', icon: Building2,       end: false },
  { to: '/dashboard/analytics',   label: 'Analytics',   icon: BarChart3,       end: false },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`shrink-0 overflow-hidden border-r border-border bg-muted/60 transition-all duration-200 ${
          sidebarOpen ? 'w-60' : 'w-0 border-r-0'
        }`}
      >
        <div className="flex h-full w-60 flex-col">
          <div className="border-b border-border p-5">
            <Logo compact subtitle="Admin Portal" />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="px-3 pb-2 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </p>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border p-3 mt-auto">
            <div className="mb-2 px-3 py-1.5 leading-tight">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Layout Wrapper ─────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Header ────────────────────────────────── */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden text-right leading-tight sm:block border-l border-border pl-4">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* ── Main Content Area ─────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
