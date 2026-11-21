import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product } from '../types/marketplace';
import { titanApi } from '../services/api';
import { SafeImage } from './SafeImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await titanApi.getProducts({ search: query.trim(), sort: 'popular' });
        if (active) {
          setResults(res.products.slice(0, 6));
        }
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(query.trim() ? `/marketplace?search=${encodeURIComponent(query.trim())}` : '/marketplace');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#08051E]/78 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search TITAN digital products"
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-violet-400/30 bg-[#151042]/98 shadow-[0_24px_70px_-15px_rgba(79,70,229,0.55)] backdrop-blur-xl"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-violet-300/20 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-[#22D3EE]" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search UI systems, AI tools, templates, courses..."
                className="w-full bg-transparent text-base text-white placeholder-[#C7CEEA]/65 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-medium text-[#C7CEEA] hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="rounded-lg p-1.5 text-[#C7CEEA] hover:bg-violet-500/20 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 animate-pulse rounded-xl bg-violet-400/12" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-white">No digital products matched &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-[#C7CEEA]">
                    Try searching for UI Design System, AI Coding Assistant, or SaaS Dashboard.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-3 pb-1.5 pt-1 text-xs font-medium text-[#C7CEEA]">
                    {query.trim() ? 'Matching digital products' : 'Popular on TITAN'}
                  </p>
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-violet-500/18"
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="truncate text-xs text-[#C7CEEA]">
                          {item.categoryName} · {item.creator}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#22D3EE]">
                        ${item.price}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-violet-300/18 bg-[#0E0A2C]/90 px-5 py-3">
              <span className="text-xs text-[#C7CEEA]">Press Enter to filter the full catalog</span>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE] hover:text-white cursor-pointer"
              >
                Explore Marketplace
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
