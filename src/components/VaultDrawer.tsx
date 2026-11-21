import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getLicenseUnitPrice, LICENSE_LABELS } from '../types/marketplace';
import { useVault } from '../context/VaultContext';
import { SafeImage } from './SafeImage';

export function VaultDrawer() {
  const { items, totalItems, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeFromVault } =
    useVault();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-[#08051E]/75 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Vault"
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-violet-400/25 bg-gradient-to-b from-[#171147] via-[#120D38] to-[#0D092A] shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-violet-300/18 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#22D3EE]" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold text-white">Your Vault</h2>
                <span className="font-mono text-xs tabular-nums text-[#C7CEEA]">
                  ({totalItems})
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close Vault drawer"
                className="rounded-lg p-2 text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/25 bg-violet-500/15 text-[#22D3EE]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-white">
                    Your Vault is currently empty
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm text-[#C7CEEA]">
                    Explore TITAN&apos;s curated UI systems, AI developer tools, and templates to build your stack.
                  </p>
                  <Link
                    to="/marketplace"
                    onClick={closeDrawer}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button"
                  >
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-violet-300/15">
                  {items.map((item) => {
                    const unitPrice = getLicenseUnitPrice(item.basePrice, item.license);
                    return (
                      <li key={`${item.productId}_${item.license}`} className="flex gap-4 py-4 first:pt-0">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeDrawer}
                          className="h-16 w-22 shrink-0 overflow-hidden rounded-lg border border-violet-300/20 bg-[#1B1452]"
                        >
                          <SafeImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/product/${item.slug}`}
                              onClick={closeDrawer}
                              className="truncate text-sm font-semibold text-white hover:text-[#22D3EE]"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromVault(item.productId, item.license)}
                              aria-label={`Remove ${item.name}`}
                              className="rounded p-1 text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-[#C7CEEA]">
                            {LICENSE_LABELS[item.license].name}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-violet-300/20 bg-[#0F0B2E]">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.license, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center text-[#C7CEEA] hover:text-white cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs tabular-nums text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.license, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center text-[#C7CEEA] hover:text-white cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-mono text-sm font-semibold tabular-nums text-white">
                              ${(unitPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-violet-300/18 bg-[#0D092A]/95 px-6 py-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C7CEEA]">Vault Subtotal</span>
                  <span className="font-mono text-lg font-bold tabular-nums text-white">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#C7CEEA]">
                  Instant digital delivery &amp; license keys upon checkout.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    to="/vault"
                    onClick={closeDrawer}
                    className="flex items-center justify-center rounded-xl border border-violet-300/25 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500/25 whitespace-nowrap"
                  >
                    Open Vault
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white titan-glow-button whitespace-nowrap"
                  >
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
