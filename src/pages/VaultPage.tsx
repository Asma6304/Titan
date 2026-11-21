import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { getLicenseUnitPrice, LICENSE_LABELS, type LicenseTier } from '../types/marketplace';
import { useVault } from '../context/VaultContext';
import { SafeImage } from '../components/SafeImage';

export function VaultPage() {
  const { items, totalItems, subtotal, updateQuantity, updateLicense, removeFromVault, clearVault } =
    useVault();

  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-violet-300/18 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
              Shopping Vault
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Your Digital Vault
            </h1>
            <p className="mt-2 text-sm text-[#C7CEEA]">
              Review license tiers, manage seat quantities, and proceed to instant digital delivery.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearVault}
              className="self-start text-xs font-medium text-[#C7CEEA] transition-colors hover:text-rose-400 sm:self-auto cursor-pointer"
            >
              Clear Vault
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl titan-glass p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/22 bg-[#181247] text-[#A855F7]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-white">
              Your Shopping Vault is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#C7CEEA]">
              Browse TITAN&apos;s marketplace to add UI design systems, AI developer tools, courses, and templates to your Vault.
            </p>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white titan-glow-button"
            >
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Vault Items List */}
            <div className="space-y-4 lg:col-span-8">
              {items.map((item) => {
                const unitPrice = getLicenseUnitPrice(item.basePrice, item.license);
                return (
                  <article
                    key={`${item.productId}_${item.license}`}
                    className="flex flex-col gap-5 rounded-2xl titan-glass p-5 sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-violet-300/22 bg-[#181247] sm:h-24 sm:w-32"
                    >
                      <SafeImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#22D3EE]">{item.categoryName}</p>
                      <Link
                        to={`/product/${item.slug}`}
                        className="mt-0.5 block truncate font-display text-lg font-semibold text-white hover:text-[#22D3EE]"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label htmlFor={`lic-${item.productId}-${item.license}`} className="sr-only">
                          License tier for {item.name}
                        </label>
                        <select
                          id={`lic-${item.productId}-${item.license}`}
                          value={item.license}
                          onChange={(e) =>
                            updateLicense(item.productId, item.license, e.target.value as LicenseTier)
                          }
                          className="rounded-lg border border-violet-300/25 bg-[#0F0B2E] px-3 py-1.5 text-xs text-white focus:border-[#22D3EE] focus:outline-none"
                        >
                          {(['standard', 'team', 'enterprise'] as LicenseTier[]).map((tier) => (
                            <option key={tier} value={tier} className="bg-[#181247]">
                              {LICENSE_LABELS[tier].name} (${getLicenseUnitPrice(item.basePrice, tier)})
                            </option>
                          ))}
                        </select>

                        <div className="inline-flex items-center rounded-lg border border-violet-300/25 bg-[#0F0B2E]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.license, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center text-[#C7CEEA] hover:text-white cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs tabular-nums text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.license, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center text-[#C7CEEA] hover:text-white cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-violet-300/18 pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <span className="font-mono text-lg font-semibold tabular-nums text-white">
                        ${(unitPrice * item.quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromVault(item.productId, item.license)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#C7CEEA] transition-colors hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Summary Panel */}
            <aside className="rounded-2xl titan-glass-elevated p-6 lg:sticky lg:top-24 lg:col-span-4">
              <h2 className="font-display text-lg font-semibold text-white">Vault Summary</h2>
              <dl className="mt-5 space-y-3 border-b border-violet-300/18 pb-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#C7CEEA]">Items ({totalItems})</dt>
                  <dd className="font-mono tabular-nums text-white">${subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#C7CEEA]">Estimated Tax (8%)</dt>
                  <dd className="font-mono tabular-nums text-white">${estimatedTax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#C7CEEA]">Digital Delivery</dt>
                  <dd className="text-emerald-400">Instant · Free</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-white">Estimated Total</span>
                <span className="font-mono text-2xl font-bold tabular-nums text-white">
                  ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <p className="mt-2 text-xs text-[#C7CEEA]">
                Promo codes like <span className="font-mono text-white">TITAN15</span> or{' '}
                <span className="font-mono text-white">LAUNCH20</span> can be applied at checkout.
              </p>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/marketplace"
                className="mt-3 block text-center text-xs font-medium text-[#C7CEEA] hover:text-white"
              >
                Continue exploring marketplace
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
