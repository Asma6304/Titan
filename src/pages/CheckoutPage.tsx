import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Lock,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { getLicenseUnitPrice, LICENSE_LABELS, type Order } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useVault } from '../context/VaultContext';
import { SafeImage } from '../components/SafeImage';

const PAYMENT_METHODS = [
  'Test Card (Visa •••• 4242)',
  'Test Digital Wallet',
  'Test Enterprise Invoice',
] as const;

export function CheckoutPage() {
  const { items, subtotal, clearVault } = useVault();
  const { user, token, recordSessionOrder } = useAuth();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [billingCountry, setBillingCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>(
    PAYMENT_METHODS[0]
  );

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    description: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const discount = appliedPromo ? Math.round((subtotal * appliedPromo.discountPercent) / 100) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.08 * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const res = await titanApi.validatePromo(promoInput.trim());
      setAppliedPromo(res);
      showToast(`Promo ${res.code} applied`, { description: res.description, tone: 'success' });
    } catch (err) {
      setAppliedPromo(null);
      showToast(err instanceof Error ? err.message : 'Invalid promo code', { tone: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (customerName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim().includes('@')) {
      setFormError('Please enter a valid email address for license delivery.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await titanApi.createOrder(
        {
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          billingCountry: billingCountry.trim(),
          paymentMethod,
          promoCode: appliedPromo?.code,
          items: items.map((i) => ({
            productId: i.productId,
            license: i.license,
            quantity: i.quantity,
          })),
        },
        token
      );
      setCompletedOrder(res.order);
      recordSessionOrder(res.order);
      clearVault();
      showToast('Order Confirmed (Test Mode)', {
        description: `Order ${res.order.orderNumber} is ready with your license keys.`,
        tone: 'success',
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Checkout failed. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLicense = (key: string) => {
    navigator.clipboard?.writeText(key);
    showToast('License key copied', { description: key, tone: 'info' });
  };

  // Post-Order Confirmation View
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl titan-glass-elevated p-8 sm:p-10">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase">
                Order Confirmed · Test Mode Transaction
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold text-white">
              Your Digital Assets Are Ready
            </h1>
            <p className="mt-2 text-sm text-[#C7CEEA]">
              Order <span className="font-mono text-white">{completedOrder.orderNumber}</span> has been recorded for{' '}
              <span className="text-white">{completedOrder.customerEmail}</span>. No live card charge was processed.
            </p>

            {/* License Keys & Downloads */}
            <div className="mt-8 space-y-4">
              <h2 className="font-display text-base font-semibold text-white">
                Instant Access &amp; License Keys
              </h2>
              {completedOrder.items.map((item) => (
                <div
                  key={`${item.productId}_${item.licenseKey}`}
                  className="rounded-2xl border border-violet-300/22 bg-[#0D0928]/85 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-[#C7CEEA]">
                          {LICENSE_LABELS[item.license].name} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold tabular-nums text-white">
                      ${item.lineTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-violet-300/18 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#C7CEEA]">License Key:</span>
                      <code className="font-mono text-xs text-[#22D3EE]">{item.licenseKey}</code>
                      <button
                        type="button"
                        onClick={() => copyLicense(item.licenseKey)}
                        aria-label="Copy license key"
                        className="rounded p-1 text-[#C7CEEA] hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Download package queued', {
                          description: item.downloadLabel,
                          tone: 'info',
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/25 bg-white/6 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/12 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <dl className="mt-8 space-y-2 border-t border-violet-300/22 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#C7CEEA]">Subtotal</dt>
                <dd className="font-mono tabular-nums text-white">${completedOrder.subtotal.toFixed(2)}</dd>
              </div>
              {completedOrder.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-emerald-400">Promo ({completedOrder.promoCode})</dt>
                  <dd className="font-mono tabular-nums text-emerald-400">
                    -${completedOrder.discount.toFixed(2)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#C7CEEA]">Tax</dt>
                <dd className="font-mono tabular-nums text-white">${completedOrder.tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-violet-300/22 pt-3 text-base font-semibold">
                <dt className="text-white">Total (Test Mode)</dt>
                <dd className="font-mono tabular-nums text-white">${completedOrder.total.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/orders"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white titan-glow-button"
              >
                View Order History
              </Link>
              <Link
                to="/marketplace"
                className="rounded-xl border border-violet-300/25 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Continue Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-36 pb-24 text-center">
        <div className="mx-auto max-w-md px-4">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#A855F7]" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Nothing to Check Out</h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            Add at least one digital asset to your Shopping Vault before proceeding to checkout.
          </p>
          <Link
            to="/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white titan-glow-button"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Complete Your Vault Order
          </h1>
        </div>

        {/* Clear Test Mode Payment Disclosure */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#22D3EE]/45 bg-[#06B6D4]/15 p-4 text-sm text-white/90">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22D3EE]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-white">Test Mode Payment Gateway Active</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#C7CEEA]">
              Live Stripe or Razorpay credentials are not configured in this environment. Submitting checkout simulates payment processing, validates pricing on the server, persists your order, and generates instant TITAN license keys without charging any real card.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Checkout Form */}
          <form onSubmit={handleCheckout} className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl titan-glass p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-white">Billing &amp; Delivery Details</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-name" className="block text-xs font-medium text-[#C7CEEA]">
                    Full Name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-medium text-[#C7CEEA]">
                    License Delivery Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/50 focus:border-[#22D3EE] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-country" className="block text-xs font-medium text-[#C7CEEA]">
                    Country / Region
                  </label>
                  <input
                    id="checkout-country"
                    type="text"
                    required
                    value={billingCountry}
                    onChange={(e) => setBillingCountry(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-4 py-3 text-sm text-white focus:border-[#22D3EE] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl titan-glass p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">Test Payment Method</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#C7CEEA]">
                  <Lock className="h-3.5 w-3.5 text-[#A855F7]" />
                  Simulated Gateway
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                      paymentMethod === method
                        ? 'border-[#22D3EE] bg-[#7C3AED]/22'
                        : 'border-violet-300/22 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-[#8B5CF6]"
                    />
                    <CreditCard className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" />
                    <span className="text-sm font-medium text-white">{method}</span>
                  </label>
                ))}
              </div>
            </section>

            {formError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white titan-glow-button disabled:opacity-60 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              {submitting
                ? 'Processing Test Order...'
                : `Complete Test Order — $${total.toFixed(2)}`}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <aside className="rounded-2xl titan-glass-elevated p-6 lg:sticky lg:top-24 lg:col-span-5">
            <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
            <ul className="mt-4 divide-y divide-violet-300/15">
              {items.map((item) => {
                const unitPrice = getLicenseUnitPrice(item.basePrice, item.license);
                return (
                  <li key={`${item.productId}_${item.license}`} className="flex items-center gap-3.5 py-3.5">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-[#C7CEEA]">
                        {LICENSE_LABELS[item.license].name} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold tabular-nums text-white">
                      ${(unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="mt-5 flex gap-2 border-t border-violet-300/18 pt-5">
              <div className="relative flex-1">
                <Tag
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C7CEEA]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (e.g. TITAN15)"
                  aria-label="Promo code"
                  className="w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#C7CEEA]/60 focus:border-[#22D3EE] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={promoLoading}
                className="rounded-xl border border-white/14 bg-white/8 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/14 cursor-pointer"
              >
                {promoLoading ? '...' : 'Apply'}
              </button>
            </form>

            <dl className="mt-5 space-y-2.5 border-t border-violet-300/18 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#C7CEEA]">Subtotal</dt>
                <dd className="font-mono tabular-nums text-white">${subtotal.toFixed(2)}</dd>
              </div>
              {discount > 0 && appliedPromo && (
                <div className="flex justify-between text-emerald-400">
                  <dt>Discount ({appliedPromo.code})</dt>
                  <dd className="font-mono tabular-nums">-${discount.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#C7CEEA]">Tax (8%)</dt>
                <dd className="font-mono tabular-nums text-white">${tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-violet-300/22 pt-3 text-base font-semibold">
                <dt className="text-white">Total</dt>
                <dd className="font-mono text-xl tabular-nums text-white">${total.toFixed(2)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
