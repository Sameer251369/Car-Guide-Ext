import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, MailWarning } from 'lucide-react';
import api from '../api/client';

export default function AdminLogin({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.adminLogin(form);
      if (result?.user) {
        if (onAuthenticated) onAuthenticated(result.user);
        navigate('/admin/worklist');
      }
    } catch (err) {
      const message = err?.response?.data?.detail || 'Invalid admin credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0f15] px-4 py-12">
      {/* decorative backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-orange-500/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* glowing gradient edge */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-amber-400/60 via-white/10 to-orange-500/30 opacity-70 blur-[1px]"
        />

        <div className="relative rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-10">
          {/* corner accents */}
          <span
            aria-hidden="true"
            className="absolute -right-px -top-px h-14 w-14 rounded-tr-[28px] border-r-2 border-t-2 border-amber-400/70"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px h-14 w-14 rounded-bl-[28px] border-b-2 border-l-2 border-amber-400/30"
          />

          <div className="mb-9 text-center">
            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-xl"
              />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/25 to-orange-500/10 text-amber-300">
                <Lock size={28} />
              </span>
            </div>

            <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-300">
              <span className="h-px w-6 bg-amber-400/70" aria-hidden="true" />
              Client admin
              <span className="h-px w-6 bg-amber-400/70" aria-hidden="true" />
            </p>
            <h1 className="mt-3 bg-gradient-to-b from-white to-amber-200 bg-clip-text text-4xl font-extrabold tracking-[-0.03em] text-transparent">
              Sign in
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-amber-400/80 focus:bg-black/60 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.12)]"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-amber-400/80 focus:bg-black/60 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.12)]"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
              >
                <MailWarning size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5 font-bold text-slate-950 shadow-[0_10px_30px_-8px_rgba(255,178,36,0.6)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(255,178,36,0.75)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">
                {loading ? 'Signing in...' : 'Login to admin panel'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}