import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function DashboardHome() {
  const [stats, setStats] = useState({ users: 0, departments: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [staffRes, deptRes, apptRes] = await Promise.all([
          api.get('/staff?limit=1'),
          api.get('/departments'),
          api.get('/appointments?limit=1'),
        ]);
        setStats({
          users: staffRes.data.total ?? 0,
          departments: deptRes.data.length ?? 0,
          appointments: apptRes.data.total ?? 0,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Users',
      value: stats.users,
      label: 'total users',
      icon: Users,
    },
    {
      title: 'Departments',
      value: stats.departments,
      label: 'departments',
      icon: Building2,
    },
    {
      title: 'Appointments',
      value: stats.appointments,
      label: 'total appointments',
      icon: Calendar,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">System overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          Loading overview…
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{c.title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{c.label}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Analytics</p>
                </div>
                <Link
                  to="/dashboard/analytics"
                  className="mt-6 flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 group transition-colors"
                >
                  View Reports
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-300">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
