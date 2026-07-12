import { useState } from 'react';
import { X } from 'lucide-react';
import useForm from '../../hooks/useForm';
import api from '../../services/api';

const ROLES = ['admin', 'doctor', 'receptionist'];

export default function StaffForm({ existing, departments, onSave, onClose }) {
  const isEdit = Boolean(existing);
  const { values, handleChange, setValues } = useForm({
    name:         existing?.name         ?? '',
    email:        existing?.email        ?? '',
    password:     '',
    role:         existing?.role         ?? 'doctor',
    departmentId: existing?.departmentId ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password; // don't send empty string on edit
      if (!payload.departmentId) delete payload.departmentId;

      if (isEdit) {
        await api.put(`/staff/${existing._id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.error
        || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email', disabled: isEdit },
          ].map(({ name, label, type, disabled }) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
              <input id={name} name={name} type={type} value={values[name]} onChange={handleChange}
                disabled={disabled} required={!isEdit || name !== 'email'}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
            </div>
          ))}

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-muted-foreground">
              Password {isEdit && <span className="font-normal text-muted-foreground/60">(leave blank to keep current)</span>}
            </label>
            <input id="password" name="password" type="password" value={values.password} onChange={handleChange}
              required={!isEdit} minLength={12}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            <p className="mt-0.5 text-xs text-muted-foreground">≥12 chars, upper + lower + digit</p>
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-xs font-semibold text-muted-foreground">Role</label>
            <select id="role" name="role" value={values.role} onChange={handleChange}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              {ROLES.map((r) => <option key={r} value={r} className="capitalize bg-card text-foreground">{r}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="departmentId" className="mb-1 block text-xs font-semibold text-muted-foreground">
              Department <span className="font-normal text-muted-foreground/60">(optional)</span>
            </label>
            <select id="departmentId" name="departmentId" value={values.departmentId} onChange={handleChange}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="" className="bg-card text-foreground">— None —</option>
              {departments.map((d) => <option key={d._id} value={d._id} className="bg-card text-foreground">{d.name}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-60">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
