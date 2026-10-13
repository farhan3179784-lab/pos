'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('براہ کرم ای میل اور پاس ورڈ دونوں درج کریں۔ (Please enter both email and password)');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      router.push('/billing');
    } catch (err) {
      setErrorMessage(err.message || 'غلط ای میل یا پاس ورڈ درج کیا گیا ہے۔ (Invalid credentials)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@fusion.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Light Glow & Subtle Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/50 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-200/40 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Top Header Badge & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-xs font-bold backdrop-blur-md mb-3 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>ایڈمن لاگ ان پورٹل • Super Store Admin</span>
          </div>

          {/* Logo & Store Name */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-200 border border-indigo-500/20">
              F
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>FUSION KIRYANA</span>
                <span className="text-sm font-bold font-urdu text-indigo-600">فیوژن کریانہ</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                پوائنٹ آف سیل (POS) مینجمنٹ سسٹم
              </p>
            </div>
          </div>
        </div>

        {/* Crisp Light Glassmorphism Card */}
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/5 relative overflow-hidden">
          {/* Top Edge Indigo Gradient Accent */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-500" />

          <div className="mb-6 text-center">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              ایڈمن لاگ ان (Admin Sign In)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              براہ کرم کاؤنٹر مینیجر کا ای میل اور پاس ورڈ درج کریں
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1 font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form: Only Email & Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ای میل ایڈریس (Email Address)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">ضروری ہے</span>
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-300/80 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all shadow-xs font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  پاس ورڈ (Password)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">ضروری ہے</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-300/80 rounded-2xl px-4 py-3 pr-11 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all shadow-xs font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-medium">یاد رکھیں (Remember me)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-urdu">محفوظ کاؤنٹر سیشن</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>لاگ ان ہو رہا ہے...</span>
                </>
              ) : (
                <>
                  <span>لاگ ان کریں • Sign In as Admin</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">
              تیز ٹیسٹنگ کیلئے ڈیفالٹ کریڈنشلز (Click to Auto-fill):
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-900 text-xs font-mono transition-all cursor-pointer group shadow-2xs"
              title="Click to fill default admin credentials"
            >
              <span className="text-slate-400 group-hover:text-slate-600">User:</span>
              <span className="font-bold text-slate-800 group-hover:text-indigo-700">admin@fusion.com</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 group-hover:text-slate-600">Pass:</span>
              <span className="font-bold text-emerald-600">admin123</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-[11px] text-slate-400">
          <p className="font-medium text-slate-500">فیوژن کریانہ ہول سیل سنٹر • رجانہ روڈ نزد الائیڈ پیٹرولیم کھدروالا</p>
          <p className="mt-0.5 text-slate-400 font-mono">Protected by 256-bit Secure POS Encryption</p>
        </div>
      </div>
    </div>
  );
};
