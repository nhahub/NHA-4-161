import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  Moon,
  Sun,
  Users,
  Stethoscope,
  Bell,
  Settings,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';

/* ── Intersection Observer hook for scroll-reveal ── */
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );

    const elements = root.querySelectorAll('.animate-fade-in-up');
    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Data ──────────────────────────────────────────── */
const stats = [
  { value: '4', label: 'User roles' },
  { value: '24/7', label: 'Booking' },
  { value: 'Live', label: 'Queue updates' },
  { value: '100%', label: 'Role-secured' },
];

const roles = [
  {
    title: 'Patient',
    description: 'Book, track & manage visits',
    icon: Users,
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  },
  {
    title: 'Doctor',
    description: 'Schedule & consultations',
    icon: Stethoscope,
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  {
    title: 'Receptionist',
    description: 'Queue & check-ins',
    icon: Bell,
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
  {
    title: 'Admin',
    description: 'Full system control',
    icon: Settings,
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  },
];

const steps = [
  {
    step: 1,
    title: 'Pick a department',
    description: 'Browse specialties and find the right care.',
    icon: Building2,
  },
  {
    step: 2,
    title: 'Choose your doctor',
    description: 'See profiles, fees and available slots.',
    icon: Stethoscope,
  },
  {
    step: 3,
    title: 'Confirm & track',
    description: 'Reserve, receive updates and skip the line.',
    icon: CalendarCheck,
  },
];

/* ── Landing Page Component ───────────────────────── */
export default function LandingPage() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const pageRef = useScrollReveal();

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" ref={pageRef}>
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 h-16 bg-card border-b border-border backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-foreground">MediCare</span>
          </Link>

          <ul className="hidden md:flex gap-6 list-none m-0 p-0">
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline">
                Features
              </a>
            </li>
            <li>
              <a href="#roles" onClick={(e) => { e.preventDefault(); scrollTo('roles'); }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline">
                Roles
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline">
                How it works
              </a>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="text-sm font-semibold text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors no-underline">
            Sign in
          </Link>
          <Link to="/login?tab=register" className="text-sm font-semibold text-primary-foreground bg-primary px-5 py-2 rounded-lg hover:opacity-90 transition-all no-underline">
            Sign up
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────── */}
      <section className="flex flex-col items-center text-center pt-16 md:pt-20 pb-12 px-5 max-w-3xl mx-auto">
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8"
          style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-primary" />
          Hospital Reservation System
        </div>

        <h1 className="animate-fade-in-up text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5"
          style={{ animationDelay: '0.2s' }}>
          Reserve care. <span className="text-primary">Skip the wait.</span>
        </h1>

        <p className="animate-fade-in-up text-base md:text-lg leading-relaxed text-muted-foreground max-w-xl mb-9"
          style={{ animationDelay: '0.3s' }}>
          A complete platform for patients, doctors, receptionists and admins to manage
          appointments, queues and departments — all in one calm, clinical interface.
        </p>

        <div className="animate-fade-in-up flex items-center gap-3 flex-wrap justify-center"
          style={{ animationDelay: '0.4s' }}>
          <Link to="/login?tab=register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary px-6 py-3 rounded-xl hover:opacity-92 hover:-translate-y-0.5 hover:shadow-lg transition-all no-underline">
            Sign up <ArrowRight size={16} />
          </Link>
          <Link to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground bg-card px-6 py-3 rounded-xl border border-border hover:bg-muted hover:border-muted-foreground transition-all no-underline">
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-5 pb-16" id="features">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-in-up flex flex-col items-center gap-1 py-6 px-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            <span className="text-xl font-extrabold text-primary">{s.value}</span>
            <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Roles ─────────────────────────────── */}
      <section className="py-16 md:py-20 px-5" id="roles">
        <div className="animate-fade-in-up text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Built for every role</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Each dashboard shows only what matters — no clutter, no context switching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {roles.map((r, i) => (
            <div
              key={r.title}
              className="animate-fade-in-up p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${r.iconBg}`}>
                <r.icon size={22} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{r.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="py-16 md:py-20 px-5 bg-muted" id="how-it-works">
        <div className="animate-fade-in-up text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Three steps to your visit</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="animate-fade-in-up relative pt-9 px-6 pb-6 rounded-xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${0.1 + i * 0.15}s` }}
            >
              <span className="absolute -top-3 left-5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                Step {s.step}
              </span>
              <div className="flex items-center justify-center w-10 h-10 text-primary mb-4">
                <s.icon size={28} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="py-16 md:py-20 px-5">
        <div className="animate-fade-in-up max-w-3xl mx-auto text-center py-14 md:py-16 px-6 rounded-2xl border border-border bg-card">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-3">
            Ready to see MediCare in action?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
            Sign in with a demo account — patient, doctor, receptionist or admin — and
            explore every dashboard.
          </p>
          <Link to="/login?tab=register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary px-7 py-3 rounded-xl hover:opacity-92 hover:-translate-y-0.5 hover:shadow-lg transition-all no-underline">
            Sign up now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="flex flex-col md:flex-row items-center justify-between px-6 md:px-8 py-5 border-t border-border bg-card gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white">
            <Heart size={14} fill="currentColor" />
          </div>
          <span><strong className="text-foreground font-bold">MediCare</strong> — Hospital Reservation System</span>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MediCare. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
