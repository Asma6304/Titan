import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TitanLogo } from '../components/TitanLogo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}`, { tone: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0B2E] px-4 pt-24 pb-16">
      <div className="w-full max-w-md rounded-3xl titan-glass-elevated p-8 sm:p-10">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <TitanLogo />
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Sign in to TITAN</h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            Access your Vault, synced Wishlist, and digital product licenses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-[#C7CEEA]">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-[#C7CEEA]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button disabled:opacity-60 cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#C7CEEA]">
          New to TITAN?{' '}
          <Link to="/register" className="inline-flex items-center gap-1 font-semibold text-[#22D3EE] hover:text-white">
            Create an account
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
