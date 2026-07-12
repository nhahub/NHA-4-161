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
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Reassign Head — {dept.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="headUserId" className="mb-1 block text-xs font-semibold text-slate-700">Department Head</label>
            <select id="headUserId" name="headUserId" value={values.headUserId} onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">— None —</option>
              {activeStaff.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
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
      setCreateError(err.response?.data?.error || 'Failed to create department');
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
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <p className="text-sm text-slate-500">{departments.length} active departments</p>
      </div>

      {/* ── Add department ───────────────────────── */}
      {isAdmin && (
        <div className="mb-6 max-w-sm">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              placeholder="New department name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : departments.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">No departments yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Department', 'Head', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="px-4 py-3 text-slate-600">{staffName(d.headUserId)}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setReassign(d)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Reassign head">
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(d)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Deactivate">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ───────────────────────────────── */}
      {reassignTarget && (
        <ReassignModal
          dept={reassignTarget}
          activeStaff={allStaff}
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
