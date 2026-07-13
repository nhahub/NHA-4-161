import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useForm from "../../hooks/useForm";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(values.email, values.password, values.fullName, values.phone);
      navigate("/patient-dashboard");
    } catch (err) {
      const rawError = err.response?.data?.error;
      const errorMsg = typeof rawError === 'object' ? rawError?.message : rawError;
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        errorMsg ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", delay: "0.03s" },
    { name: "email", label: "Email", type: "email", delay: "0.08s" },
    { name: "phone", label: "Phone", type: "tel", delay: "0.13s" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create account</h2>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Register as a new patient</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.name}
            className="animate-field"
            style={{ animationDelay: field.delay }}
          >
            <label htmlFor={field.name} className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-300">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={values[field.name]}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-300"
            />
          </div>
        ))}

        <div className="animate-field" style={{ animationDelay: "0.18s" }}>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 pr-11 text-sm text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 animate-tab-switch">{error}</p>}

        <div className="animate-field pt-1" style={{ animationDelay: "0.23s" }}>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 shadow-sm hover:shadow-md hover:shadow-emerald-500/10"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}