import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Heart,
  LogOut,
  Package,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { Order } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useVault } from '../context/VaultContext';
import { useWishlist } from '../context/WishlistContext';

export function DashboardPage() {
  const { user, token, isAuthenticated, updateProfile, logout } = useAuth();
  const { totalItems: vaultCount } = useVault();
  const { count: wishlistCount } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [company, setCompany] = useState(user?.company ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCompany(user.company ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    titanApi
      .getOrders(token)
      .then((res) => setOrders(res.orders))
      .catch(() => {});
  }, [token]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-36 pb-24 text-center">
        <div className="mx-auto max-w-md rounded-3xl titan-glass-elevated p-8">
          <User className="mx-auto h-10 w-10 text-[#A855F7]" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Account Dashboard</h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            Sign in or create a TITAN account to manage your profile, synced Vault, and purchased digital licenses.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-violet-300/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), company: company.trim(), bio: bio.trim() });
      showToast('Profile updated', { tone: 'success' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save profile', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    showToast('Signed out of TITAN', { tone: 'info' });
    navigate('/');
  };

  const allLicenses = orders.flatMap((o) =>
    o.items.map((item) => ({
      orderNumber: o.orderNumber,
      ...item,
    }))
  );

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-violet-300/18 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
              Member Workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-sm text-[#C7CEEA]">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-violet-300/25 bg-white/5 px-4 py-2.5 text-xs font-semibold text-[#C7CEEA] transition-colors hover:border-rose-400/50 hover:text-white sm:self-auto cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/orders" className="rounded-2xl titan-glass p-6 titan-card-hover">
            <div className="flex items-center justify-between text-[#C7CEEA]">
              <span className="text-xs font-medium">Completed Orders</span>
              <Package className="h-4 w-4 text-[#A855F7]" />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-white">{orders.length}</p>
          </Link>

          <Link to="/vault" className="rounded-2xl titan-glass p-6 titan-card-hover">
            <div className="flex items-center justify-between text-[#C7CEEA]">
              <span className="text-xs font-medium">Items in Vault</span>
              <ShieldCheck className="h-4 w-4 text-[#22D3EE]" />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-white">{vaultCount}</p>
          </Link>

          <Link to="/wishlist" className="rounded-2xl titan-glass p-6 titan-card-hover">
            <div className="flex items-center justify-between text-[#C7CEEA]">
              <span className="text-xs font-medium">Saved Wishlist</span>
              <Heart className="h-4 w-4 text-[#22D3EE]" />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-white">{wishlistCount}</p>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Profile Settings */}
          <section className="rounded-2xl titan-glass p-6 sm:p-8 lg:col-span-5">
            <h2 className="font-display text-lg font-semibold text-white">Profile Details</h2>
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-medium text-[#C7CEEA]">
                  Display Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-2.5 text-sm text-white focus:border-[#22D3EE] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prof-company" className="block text-xs font-medium text-[#C7CEEA]">
                  Company / Studio
                </label>
                <input
                  id="prof-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-2.5 text-sm text-white focus:border-[#22D3EE] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prof-bio" className="block text-xs font-medium text-[#C7CEEA]">
                  Short Bio
                </label>
                <textarea
                  id="prof-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Design lead, full-stack engineer, or founder..."
                  className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-2.5 text-sm text-white focus:border-[#22D3EE] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button disabled:opacity-60 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Digital Licenses Library */}
          <section className="rounded-2xl titan-glass p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Your Digital Licenses</h2>
              <Link to="/orders" className="text-xs font-semibold text-[#22D3EE] hover:text-white">
                View all orders
              </Link>
            </div>

            {allLicenses.length === 0 ? (
              <div className="mt-6 rounded-xl border border-violet-300/18 bg-[#0D0928]/70 p-8 text-center">
                <p className="text-sm text-[#C7CEEA]">
                  You haven&apos;t purchased any digital products yet.
                </p>
                <Link
                  to="/marketplace"
                  className="mt-4 inline-flex rounded-xl border border-violet-300/25 bg-white/6 px-4 py-2 text-xs font-semibold text-white hover:bg-white/12"
                >
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {allLicenses.map((lic) => (
                  <div
                    key={lic.licenseKey}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300/18 bg-[#0D0928]/80 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{lic.name}</p>
                      <p className="mt-0.5 text-xs text-[#C7CEEA]">
                        Order {lic.orderNumber} · {lic.license.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-[#22D3EE]">{lic.licenseKey}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(lic.licenseKey);
                          showToast('License key copied', { tone: 'info' });
                        }}
                        aria-label="Copy license key"
                        className="rounded p-1.5 text-[#C7CEEA] hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
