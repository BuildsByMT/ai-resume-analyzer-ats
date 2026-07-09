import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

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
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, action: mode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === 'GOOGLE_ALREADY_REGISTERED') {
          setErrorMsg(data.message || 'This Google account is already registered. Redirecting to Log In...');
          setTimeout(() => {
            navigate('/login');
            setErrorMsg('');
          }, 3000);
          return;
        } else if (data.code === 'GOOGLE_NOT_REGISTERED') {
          setErrorMsg(data.message || 'Account not found. Redirecting to Sign Up...');
          setTimeout(() => {
            navigate('/signup');
            setErrorMsg('');
          }, 3000);
          return;
        }
        throw new Error(data.message || data.error || 'Google Authentication failed.');
      }

      setAuth(data.user, data.token);
      setSuccessMsg('Logged in with Google successfully!');
      setIsRedirecting(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Something went wrong during Google Login.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/login');
          setIsRedirecting(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
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

      <div className="glass-card w-full max-w-md rounded-2xl p-5 sm:p-8 relative overflow-hidden z-10">
        {isRedirecting && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
                <div className="absolute w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <ShieldCheck size={16} className="animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-100">
                  {mode === 'login' ? 'Authorizing Secure Session...' : 'Creating User Profile...'}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  {mode === 'login' ? 'Decrypting workspace environment' : 'Setting up TiDB database records'}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => { navigate('/dashboard'); }}
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
              disabled={isLoading || isGoogleLoading}
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

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-900"></div>
            <span className="flex-shrink mx-4 text-slate-600 text-xs font-bold uppercase">or</span>
            <div className="flex-grow border-t border-slate-900"></div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-slate-950/40 border border-slate-900 hover:border-slate-800 text-slate-200 font-semibold py-3 rounded-xl transition-all duration-300 hover:bg-slate-950/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { navigate(mode === 'login' ? '/signup' : '/login'); }}
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
