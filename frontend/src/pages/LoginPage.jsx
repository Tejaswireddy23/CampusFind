import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Hash, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from =
    location.state?.from?.pathname && location.state.from.pathname !== '/login'
      ? location.state.from.pathname
      : '/dashboard';

  const executeLogin = async (id, pwd) => {
    setErrorMsg('');
    setLoading(true);

    const res = await login(id.trim(), pwd);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeLogin(identifier, password);
  };

  const fillAndLogin = async (demoId, demoPassword) => {
    setIdentifier(demoId);
    setPassword(demoPassword);
    await executeLogin(demoId, demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 card-shadow">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-4 shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Campus<span className="text-primary">Find</span> Student Login
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500">
            Sign in to access the Campus Lost & Found Portal.
          </p>
        </div>

        {/* Demo Credentials Quick Click */}
        <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/60 text-xs text-neutral-700 space-y-2">
          <div className="font-semibold text-orange-950 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" />
              Demo Logins (Evaluation & Testing):
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-200 text-orange-800">
              Demo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillAndLogin('admin@campusfind.edu', 'Admin@123')}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Demo: Campus Admin
            </button>
            <button
              type="button"
              onClick={() => fillAndLogin('STU2024001', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-800 font-medium hover:bg-neutral-50 transition-colors active:scale-95 cursor-pointer text-xs"
            >
              Demo: Student Aravind
            </button>
            <button
              type="button"
              onClick={() => fillAndLogin('STU2024002', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-800 font-medium hover:bg-neutral-50 transition-colors active:scale-95 cursor-pointer text-xs"
            >
              Demo: Student Priya
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
              errorMsg.toLowerCase().includes('waiting for administrator approval')
                ? 'bg-orange-50 border-orange-200 text-orange-900'
                : errorMsg.toLowerCase().includes('rejected')
                ? 'bg-red-50 border-red-200 text-red-900'
                : errorMsg.toLowerCase().includes('suspended')
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base shrink-0">
                {errorMsg.toLowerCase().includes('waiting')
                  ? '🟠'
                  : errorMsg.toLowerCase().includes('rejected')
                  ? '🔴'
                  : errorMsg.toLowerCase().includes('suspended')
                  ? '⛔'
                  : '⚠️'}
              </span>
              <div className="flex-1 space-y-1">
                <span className="font-bold block">
                  {errorMsg.toLowerCase().includes('waiting')
                    ? 'Pending Administrator Approval'
                    : errorMsg.toLowerCase().includes('rejected')
                    ? 'Registration Request Rejected'
                    : errorMsg.toLowerCase().includes('suspended')
                    ? 'Account Suspended'
                    : 'Sign-in Failed'}
                </span>
                <p>{errorMsg}</p>
                {(errorMsg.toLowerCase().includes('waiting') || errorMsg.toLowerCase().includes('rejected')) && (
                  <Link
                    to="/account-status"
                    state={{ identifier }}
                    className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary-dark underline mt-1"
                  >
                    <span>Check Live Approval Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Student ID or College Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. STU2024001 or name@student.college.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In to Campus <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 flex flex-col items-center gap-2 text-xs text-neutral-500">
          <div>
            New student?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create your CampusFind student account.
            </Link>
          </div>
          <div>
            Waiting for approval?{' '}
            <Link to="/account-status" className="font-semibold text-neutral-700 hover:text-primary transition-colors">
              Check your Account Status.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
