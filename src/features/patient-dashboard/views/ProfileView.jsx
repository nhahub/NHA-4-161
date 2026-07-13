import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import useDarkMode from "../../../hooks/useDarkMode";

export default function ProfileView() {
  const { user } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details and preferences.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Account information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Full name</p>
              <p className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Email</p>
              <p className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Phone</p>
              <p className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground">{user?.phone || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Role</p>
              <p className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm capitalize text-foreground">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => isDark && toggleDarkMode()}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  !isDark ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => !isDark && toggleDarkMode()}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  isDark ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}