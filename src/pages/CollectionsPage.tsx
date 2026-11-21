import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Collection } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useVault } from '../context/VaultContext';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export function CollectionsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const { addBundleToVault } = useVault();

  useEffect(() => {
    let active = true;
    setLoading(true);
    titanApi
      .getCollections()
      .then((res) => {
        if (!active) return;
        setCollections(res.collections);
        if (slug) {
          setSelected(res.collections.find((c) => c.slug === slug) ?? null);
        } else {
          setSelected(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (slug && selected) {
    const includedProducts = selected.products ?? [];
    const regularTotal = includedProducts.reduce((sum, p) => sum + p.price, 0);
    const discountedTotal = Math.round(regularTotal * (1 - selected.bundleDiscountPercent / 100));

    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/collections"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C7CEEA] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Curated Collections
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl titan-glass">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative aspect-[16/10] lg:col-span-6 lg:aspect-auto">
                <SafeImage
                  src={selected.image}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:col-span-6 lg:p-10">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
                  {selected.subtitle}
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                  {selected.name}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#C7CEEA] sm:text-base">
                  {selected.description}
                </p>

                <div className="mt-6 flex items-baseline gap-3 border-y border-violet-300/18 py-4">
                  <span className="font-mono text-2xl font-bold tabular-nums text-white">
                    ${discountedTotal}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-[#C7CEEA] line-through">
                    ${regularTotal}
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    Save {selected.bundleDiscountPercent}% with code LAUNCH20
                  </span>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => addBundleToVault(includedProducts, selected.name)}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Add Full Collection to Vault ({includedProducts.length} items)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-white">
              Included in {selected.name}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {includedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Hand-Picked Suites
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Curated For Your Next Big Idea
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#C7CEEA] sm:text-base">
            Thematic product bundles designed to work seamlessly together across design, engineering, AI workflows, and startup launches.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {collections.map((col) => {
            const included = col.products ?? [];
            const regularTotal = included.reduce((sum, p) => sum + p.price, 0);
            const bundlePrice = Math.round(regularTotal * (1 - col.bundleDiscountPercent / 100));

            return (
              <article
                key={col.id}
                className="overflow-hidden rounded-2xl titan-glass transition-colors hover:border-white/15"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="relative aspect-[16/10] lg:col-span-5 lg:aspect-auto">
                    <SafeImage
                      src={col.image}
                      alt={col.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C7CEEA]">
                        <span className="font-medium text-[#22D3EE]">{col.subtitle}</span>
                        <span className="font-mono tabular-nums">
                          {included.length} assets · Save {col.bundleDiscountPercent}%
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-2xl font-bold text-white">
                        {col.name}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">
                        {col.description}
                      </p>

                      {/* Included product list */}
                      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/85">
                        {included.map((item) => (
                          <Link
                            key={item.id}
                            to={`/product/${item.slug}`}
                            className="underline decoration-white/25 underline-offset-4 hover:text-[#22D3EE]"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-violet-300/18 pt-5">
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-mono text-xl font-bold tabular-nums text-white">
                          ${bundlePrice}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-[#C7CEEA] line-through">
                          ${regularTotal}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/collections/${col.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300/25 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                        >
                          Explore Collection
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => addBundleToVault(included, col.name)}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white titan-glow-button cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Add Bundle to Vault
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
