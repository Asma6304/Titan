import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TitanLogo } from '../components/TitanLogo';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        company: company.trim() || undefined,
      });
      showToast('Account created', {
        description: `Welcome to TITAN, ${user.name}.`,
        tone: 'success',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
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
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Create Your TITAN Account</h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            Manage digital product licenses, sync your Vault, and track order history.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-[#C7CEEA]">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Ellis"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-[#C7CEEA]">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@studio.com"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-company" className="block text-xs font-medium text-[#C7CEEA]">
              Studio or Company (Optional)
            </label>
            <input
              id="reg-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Northwind Digital"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-[#C7CEEA]">
              Password (minimum 8 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-xs font-medium text-[#C7CEEA]">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
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
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#C7CEEA]">
          Already have an account?{' '}
          <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-[#22D3EE] hover:text-white">
            Sign In
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
