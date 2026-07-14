import { useCallback, useEffect, useState } from 'react';
import { Plus, UserCog, Trash2 } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';

function ReassignModal({ dept, activeStaff, onSave, onClose }) {
  const { values, handleChange } = useForm({ headUserId: dept.headUserId ?? '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/departments/${dept._id}/reassign-head`, {
        headUserId: values.headUserId || null,
      });
      onSave();
    } catch (err) {
      const rawError = err.response?.data?.error;
      const msg = typeof rawError === 'object' ? rawError?.message : rawError;
      setError(msg || 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-foreground">Reassign Head — {dept.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="headUserId" className="mb-1 block text-xs font-semibold text-muted-foreground">Department Head</label>
            <select id="headUserId" name="headUserId" value={values.headUserId} onChange={handleChange}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">— None —</option>
              {activeStaff.map((s) => (
                <option key={s._id} value={s._id} className="bg-card text-foreground">{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-60">
              {loading ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const [departments, setDepts]       = useState([]);
  const [allStaff, setAllStaff]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newName, setNewName]         = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');
  const [reassignTarget, setReassign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockInfo, setBlockInfo]     = useState(null); // ACTIVE_DEPENDENCIES_EXIST info

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, staffRes] = await Promise.all([
        api.get('/departments'),
        api.get('/staff?limit=200'),
      ]);
      setDepts(deptRes.data);
      setAllStaff(staffRes.data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const staffName = (id) => allStaff.find((s) => s._id === id)?.name ?? '—';

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/departments', { name: newName.trim() });
      setNewName('');
      fetchAll();
    } catch (err) {
      const rawError = err.response?.data?.error;
      const msg = typeof rawError === 'object' ? rawError?.message : rawError;
      setCreateError(msg || 'Failed to create department');
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/departments/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      const data = err.response?.data;
      setDeleteTarget(null);
      if (data?.error === 'ACTIVE_DEPENDENCIES_EXIST') {
        setBlockInfo(data.detail);
      }
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
        <p className="text-sm text-muted-foreground">{departments.length} active departments</p>
      </div>

      {/* ── Add department ───────────────────────── */}
      {isAdmin && (
        <div className="mb-6 max-w-sm">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              placeholder="New department name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
            />
            <button type="submit" disabled={creating || !newName.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
          {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
        </div>
      )}

      {/* ── List ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
        ) : departments.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">No departments yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {departments.map((d) => (
              <div key={d._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-muted/40 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Head: <span className="font-medium text-foreground">{staffName(d.headUserId)}</span>
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setReassign(d)}
                      className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Reassign head"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Deactivate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────── */}
      {reassignTarget && (
        <ReassignModal
          dept={reassignTarget}
          activeStaff={allStaff.filter((s) => s.role === 'doctor')}
          onSave={() => { setReassign(null); fetchAll(); }}
          onClose={() => setReassign(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Deactivate department?"
          message={`"${deleteTarget.name}" will be deactivated. All staff and the head must be reassigned first.`}
          confirmLabel="Deactivate"
          danger
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {blockInfo && (
        <ConfirmModal
          title="Cannot deactivate — dependencies exist"
          message="This department still has active staff or a head assigned."
          detail={blockInfo}
          onClose={() => setBlockInfo(null)}
        />
      )}
    </div>
  );
}
