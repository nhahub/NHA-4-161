import { useState } from 'react';
import Logo from '../../components/Logo';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const { message, hideToast } = useToast();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden animate-gradient-drift">
      {/* Background ambient light blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[90px] animate-pulse-glow-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] animate-pulse-glow-2 pointer-events-none" />

      <Toast message={message} onClose={hideToast} />

      <div className="relative z-10 w-full max-w-md animate-card-entrance">
        {/* Floating brand container */}
        <div className="animate-float-logo mb-6">
          <Logo />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden backdrop-blur-sm">
          {/* Animated Tab Switch Buttons */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 transform active:scale-98 ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/30'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 transform active:scale-98 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/30'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content Wrapper with key to re-trigger animation on switch */}
          <div key={activeTab} className="p-8 animate-tab-switch">
            {activeTab === 'signin' ? <SignInForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}