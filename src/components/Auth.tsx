import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
}

const validatePassword = (pass: string) => {
  if (pass.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(pass)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(pass)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(pass)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(pass)) {
    return 'Password must contain at least one special character (e.g., !, @, #, etc.).';
  }
  return null;
};

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const { setAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      const pwdError = validatePassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Authentication failed. Please try again.');
      }

      if (mode === 'login') {
        setAuth(data.user, data.token);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          window.location.hash = '#/dashboard';
        }, 1000);
      } else {
        setSuccessMsg('Registration successful! You can now log in.');
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic validation helper
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none bg-glow-glow"></div>

      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-8 relative z-10">
        <button
          onClick={() => { window.location.hash = '#/dashboard'; }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all duration-300 hover:bg-slate-900 cursor-pointer mb-6"
        >
          <ArrowLeft size={14} className="text-cyan-500" />
          Back to Dashboard
        </button>
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 text-cyan-400 mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === 'login' 
              ? 'Sign in to access your resume grading database' 
              : 'Sign up to analyze and generate unlimited resumes'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            {successMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Dynamic Password Strength Checker (Signup Only) */}
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2.5 p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Password Requirements:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${rules.length ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                    <span className={rules.length ? 'text-emerald-400' : 'text-slate-500'}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${rules.uppercase ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                    <span className={rules.uppercase ? 'text-emerald-400' : 'text-slate-500'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${rules.lowercase ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                    <span className={rules.lowercase ? 'text-emerald-400' : 'text-slate-500'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${rules.number ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                    <span className={rules.number ? 'text-emerald-400' : 'text-slate-500'}>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${rules.special ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                    <span className={rules.special ? 'text-emerald-400' : 'text-slate-500'}>One special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {mode === 'login' ? 'Log In' : 'Sign Up'}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { window.location.hash = mode === 'login' ? '#/signup' : '#/login'; }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
