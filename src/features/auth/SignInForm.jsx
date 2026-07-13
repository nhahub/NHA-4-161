import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      if (user?.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard/staff');
      }
    } catch (err) {
      const rawError = err.response?.data?.error;
      const msg = typeof rawError === 'object' ? rawError?.message : rawError;
      setError(msg || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field Wrapper with staggered animation */}
        <div className="animate-field" style={{ animationDelay: '0.05s' }}>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-300"
          />
        </div>

        {/* Password Field Wrapper with staggered animation */}
        <div className="animate-field" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-300"
          />
        </div>

        {error && <p className="text-sm text-red-600 animate-tab-switch">{error}</p>}

        {/* Submit Button with staggered animation */}
        <div className="animate-field pt-1" style={{ animationDelay: '0.15s' }}>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 shadow-sm hover:shadow-md hover:shadow-emerald-500/10"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}