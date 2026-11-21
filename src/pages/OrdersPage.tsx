import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Download, Package } from 'lucide-react';
import { LICENSE_LABELS, type Order } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeImage } from '../components/SafeImage';

export function OrdersPage() {
  const { token, isAuthenticated, recentSessionOrders } = useAuth();
  const { showToast } = useToast();
  const [serverOrders, setServerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    titanApi
      .getOrders(token)
      .then((res) => {
        if (active) setServerOrders(res.orders);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  // Combine persisted account orders with any guest checkout orders from this session
  const orders: Order[] = isAuthenticated
    ? serverOrders
    : recentSessionOrders;

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Digital Receipts
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Order History
          </h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            Access past transactions, download archives, and copy verified TITAN license keys.
          </p>
        </div>

        {!isAuthenticated && orders.length === 0 ? (
          <div className="mt-12 rounded-2xl titan-glass p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-xl font-semibold text-white">
              Sign in to view your saved orders
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#C7CEEA]">
              Account holders can access lifetime order receipts and download keys across sessions.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button"
              >
                Sign In
              </Link>
              <Link
                to="/marketplace"
                className="rounded-xl border border-violet-300/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-10 space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-2xl titan-glass p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-xl font-semibold text-white">No orders yet</h2>
            <p className="mt-2 text-sm text-[#C7CEEA]">
              Once you check out from your Vault, your receipts and license keys will appear here.
            </p>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white titan-glow-button"
            >
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-2xl titan-glass">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-300/18 bg-[#19124B]/80 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                    <div>
                      <span className="text-[#C7CEEA]">Order </span>
                      <span className="font-mono font-semibold text-white">{order.orderNumber}</span>
                    </div>
                    <div className="text-[#C7CEEA]">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-emerald-400 font-medium">
                      {order.status} · Test Mode
                    </div>
                  </div>
                  <span className="font-mono text-base font-bold tabular-nums text-white">
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                <div className="divide-y divide-violet-300/15 px-6">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}_${item.licenseKey}`}
                      className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-20 shrink-0 rounded-lg object-cover"
                        />
                        <div>
                          <Link
                            to={`/product/${item.slug}`}
                            className="font-display text-base font-semibold text-white hover:text-[#22D3EE]"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-[#C7CEEA]">
                            {LICENSE_LABELS[item.license].name} · Qty {item.quantity} ·{' '}
                            <span className="font-mono text-[#22D3EE]">{item.licenseKey}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(item.licenseKey);
                            showToast('License key copied', { description: item.licenseKey, tone: 'info' });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/25 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Key
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            showToast('Download ready', {
                              description: item.downloadLabel,
                              tone: 'info',
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
