import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import type { Product } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { productIds, clearWishlist } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    titanApi
      .getProducts()
      .then((res) => setAllProducts(res.products))
      .finally(() => setLoading(false));
  }, []);

  const savedProducts = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-violet-300/18 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
              Saved Assets
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Your Wishlist
            </h1>
            <p className="mt-2 text-sm text-[#C7CEEA]">
              Bookmark digital products across devices and move them to your Vault whenever you&apos;re ready.
            </p>
          </div>
          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="self-start text-xs font-medium text-[#C7CEEA] hover:text-rose-400 sm:self-auto cursor-pointer"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[420px] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="mt-12 rounded-2xl titan-glass p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/22 bg-[#181247] text-[#22D3EE]">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-white">
              No saved items yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#C7CEEA]">
              Tap the heart icon on any digital product to save it here for quick comparison.
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
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
