import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import type { Category, Product } from '../types/marketplace';
import { titanApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest Releases' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'popular');
  const [maxPrice, setMaxPrice] = useState<number>(600);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    titanApi
      .getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    const paramCat = searchParams.get('category');
    if (paramSearch !== null && paramSearch !== search) setSearch(paramSearch);
    if (paramCat !== null && paramCat !== selectedCategory) setSelectedCategory(paramCat);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const res = await titanApi.getProducts({
          search: search.trim(),
          category: selectedCategory,
          sort,
          maxPrice,
        });
        if (active) setProducts(res.products);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load catalog.');
      } finally {
        if (active) setLoading(false);
      }
    }, 140);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, selectedCategory, sort, maxPrice]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSort('popular');
    setMaxPrice(600);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(search.trim() || selectedCategory !== 'all' || maxPrice < 600);

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Digital Catalog
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Explore the TITAN Marketplace
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#C7CEEA] sm:text-base">
                Filter across production UI design systems, AI engineering tools, templates, digital courses, and 3D assets.
              </p>
            </div>
            <p className="font-mono text-xs tabular-nums text-[#C7CEEA]">
              {loading ? 'Updating catalog...' : `${products.length} digital ${products.length === 1 ? 'product' : 'products'} shown`}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl titan-glass p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7CEEA]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, tool, or creator..."
              aria-label="Search marketplace products"
              className="w-full rounded-xl border border-violet-300/25 bg-[#0D0928]/85 py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#C7CEEA]/65 focus:border-[#22D3EE] focus:outline-none"
            />
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-3 lg:col-span-4">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#C7CEEA]" aria-hidden="true" />
            <label htmlFor="price-range" className="text-xs font-medium text-[#C7CEEA] whitespace-nowrap">
              Max Price:
            </label>
            <input
              id="price-range"
              type="range"
              min={50}
              max={600}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#8B5CF6]"
            />
            <span className="w-14 text-right font-mono text-xs font-semibold tabular-nums text-white">
              ${maxPrice}
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 lg:col-span-3">
            <label htmlFor="sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-violet-300/25 bg-[#0F0B2E] px-3.5 py-2.5 text-sm text-white focus:border-[#22D3EE] focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#181247]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white'
                : 'border border-violet-300/22 bg-white/4 text-[#C7CEEA] hover:border-white/20 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white'
                  : 'border border-violet-300/22 bg-white/4 text-[#C7CEEA] hover:border-white/20 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#22D3EE] hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* Catalog Grid */}
        {error ? (
          <div className="mt-12 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <p className="text-sm font-medium text-white">{error}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[420px] animate-pulse rounded-2xl bg-white/4" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 rounded-2xl titan-glass p-12 text-center">
            <h2 className="font-display text-xl font-semibold text-white">No matching products found</h2>
            <p className="mt-2 text-sm text-[#C7CEEA]">
              Try broadening your price ceiling, switching categories, or clearing your search query.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: Math.min(idx, 8) * 0.045, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
