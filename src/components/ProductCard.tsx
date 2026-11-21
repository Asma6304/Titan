import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../types/marketplace';
import { useVault } from '../context/VaultContext';
import { useWishlist } from '../context/WishlistContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToVault } = useVault();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight((prev) => ({ ...prev, active: false }))}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl titan-glass titan-card-hover"
    >
      {/* Interactive cursor-reactive luminous sheen across card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: spotlight.active ? 1 : 0,
          background: `radial-gradient(360px circle at ${spotlight.x}px ${spotlight.y}px, rgba(34, 211, 238, 0.16), rgba(168, 85, 247, 0.08) 42%, transparent 72%)`,
        }}
      />

      {/* Consistent 4:3 media viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181247]">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            fallbackLabel={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F0B2E]/75 via-transparent to-transparent"
          />
        </Link>

        {/* Wishlist toggle button with spring pop */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => toggleWishlist(product.id, product.name)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
            wishlisted
              ? 'border-[#EC4899]/70 bg-[#EC4899]/25 text-white'
              : 'border-violet-300/25 bg-[#0F0B2E]/75 text-[#C7CEEA] hover:border-[#22D3EE]/60 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform ${wishlisted ? 'fill-[#F472B6] text-[#F472B6] scale-110' : ''}`} />
        </motion.button>
      </div>

      {/* Card Content */}
      <div className="relative z-20 flex flex-1 flex-col p-5">
        {/* Clean unboxed inline metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#C7CEEA]">
          <Link
            to={`/categories/${product.categorySlug}`}
            className="truncate font-semibold tracking-wide text-[#22D3EE] transition-colors hover:text-white"
          >
            {product.categoryName}
          </Link>
          <span className="inline-flex shrink-0 items-center gap-1 font-mono tabular-nums text-[#C7CEEA]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-white">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </span>
        </div>

        <Link to={`/product/${product.slug}`} className="mt-2.5 block">
          <h3 className="font-display text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#E879F9]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#C7CEEA]">
          {product.description}
        </p>

        {/* Price + Action baseline aligned at bottom */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-violet-300/15 pt-4 mt-5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold tabular-nums text-white">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono text-xs tabular-nums text-[#C7CEEA]/70 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => addToVault(product, 'standard')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white border border-violet-300/30 shadow-[0_6px_18px_-4px_rgba(124,58,237,0.5)] transition-all hover:from-[#8B5CF6] hover:to-[#06B6D4] hover:border-cyan-300/50 hover:shadow-[0_8px_24px_-4px_rgba(6,182,212,0.5)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Add to Vault
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
