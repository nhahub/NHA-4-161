import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const STATUS_COLORS = {
  scheduled: '#10b981', // emerald
  attended:  '#3b82f6', // blue
  cancelled: '#ef4444', // red
  'no-show': '#f59e0b', // amber
};

const CHART_COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLast] = useState(null);
  const intervalRef           = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/analytics/weekly');
      setData(res.data);
      setLast(new Date());
    } catch (err) {
      console.error('[Analytics] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll every 10s — but pause when the tab is hidden to spare Atlas free-tier connections.
    // Page Visibility API: browser stdlib, no dependency.
    function startPolling() {
      intervalRef.current = setInterval(() => {
        if (!document.hidden) fetchData();
      }, 10_000);
    }

    function handleVisibility() {
      if (!document.hidden) fetchData(); // immediate refresh on tab focus
    }

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchData]);

  // Derived totals
  const total     = data?.byStatus.reduce((s, d) => s + d.count, 0) ?? 0;
  const scheduled = data?.byStatus.find((d) => d._id === 'scheduled')?.count ?? 0;
  const cancelled = data?.byStatus.find((d) => d._id === 'cancelled')?.count ?? 0;

  // Recharts-friendly shapes
  const statusPieData = (data?.byStatus ?? []).map((d) => ({
    name: d._id,
    value: d.count,
  }));
  const deptBarData  = (data?.byDepartment ?? []).map((d) => ({ name: d.name ?? 'Unknown', count: d.count }));
  const doctorBarData= (data?.byDoctor ?? []).map((d) => ({ name: d.name ?? 'Unknown', count: d.count }));
  const trendData    = (data?.dailyTrend ?? []).map((d) => ({ date: d._id.slice(5), count: d.count }));

  return (
    <div className="p-6 md:p-8">
      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">Last 7 days</span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400 text-sm">Loading analytics…</div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI cards ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Appointments" value={total} sub="this week" />
            <StatCard label="Scheduled" value={scheduled} sub="upcoming" />
            <StatCard label="Cancelled" value={cancelled} sub="this week" />
            <StatCard label="Cancel Rate" value={total ? `${Math.round((cancelled / total) * 100)}%` : '—'} sub="of this week" />
          </div>

          {/* ── Row 1: Trend + Pie ────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Daily trend */}
            <div className="col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Daily Appointments</h2>
              {trendData.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Appointments" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status breakdown pie */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">By Status</h2>
              {statusPieData.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                        {statusPieData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {statusPieData.map((d) => (
                      <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.name] ?? '#94a3b8' }} />
                        {d.name} ({d.value})
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Row 2: By Dept + By Doctor ───────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Top Departments</h2>
              {deptBarData.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptBarData} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Appointments" radius={[0, 4, 4, 0]}>
                      {deptBarData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Top Doctors</h2>
              {doctorBarData.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={doctorBarData} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Appointments" radius={[0, 4, 4, 0]}>
                      {doctorBarData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
