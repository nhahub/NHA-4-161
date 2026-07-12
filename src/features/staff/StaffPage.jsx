import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';
import api from '../../services/api';
import StaffForm from './StaffForm';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const ROLE_BADGE = {
  admin:        'text-purple-600 border-purple-500/30 bg-purple-500/10 dark:text-purple-400',
  doctor:       'text-info border-info/30 bg-info/15',
  receptionist: 'text-warning border-warning/30 bg-warning/15',
};

export default function StaffPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const [staff, setStaff]           = useState([]);
  const [departments, setDepts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [formTarget, setFormTarget] = useState(null);  // null | 'new' | staff object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null); // success info modal

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/staff?limit=100'),
        api.get('/departments'),
      ]);
      setStaff(staffRes.data.users);
      setTotal(staffRes.data.total);
      setDepts(deptRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const deptName = (id) => departments.find((d) => d._id === id)?.name ?? '—';

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  async function confirmDelete() {
    try {
      const res = await api.delete(`/staff/${deleteTarget._id}`);
      setDeleteTarget(null);
      setDeleteResult(res.data); // { cancelledAppointments: n }
      fetchStaff();
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* ── Header ────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground">{total} total members</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormTarget('new')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        )}
      </div>

      {/* ── Search ────────────────────────────────── */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
        />
      </div>

      {/* ── List ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">No staff members found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((s) => (
              <div key={s._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-muted/40 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{s.email}</span>
                    <span>•</span>
                    <span>{deptName(s.departmentId)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[s.role]}`}>
                    {s.role}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 border-l border-border pl-3">
                      <button
                        onClick={() => setFormTarget(s)}
                        className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────── */}
      {formTarget !== null && (
        <StaffForm
          existing={formTarget === 'new' ? null : formTarget}
          departments={departments}
          onSave={() => { setFormTarget(null); fetchStaff(); }}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Deactivate staff member?"
          message={`"${deleteTarget.name}" will be deactivated.${deleteTarget.role === 'doctor' ? ' All their future scheduled appointments will be cancelled.' : ''}`}
          confirmLabel="Deactivate"
          danger
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deleteResult && (
        <ConfirmModal
          title="Staff member deactivated"
          message={`Done. ${deleteResult.cancelledAppointments} future appointment(s) were cancelled.`}
          onClose={() => setDeleteResult(null)}
        />
      )}
    </div>
  );
}
