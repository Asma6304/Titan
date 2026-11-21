import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Download,
  FileCode2,
  Heart,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import {
  getLicenseUnitPrice,
  LICENSE_LABELS,
  type LicenseTier,
  type Product,
} from '../types/marketplace';
import { titanApi } from '../services/api';
import { useVault } from '../context/VaultContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

const LICENSE_TIERS: LicenseTier[] = ['standard', 'team', 'enterprise'];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<LicenseTier>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToVault } = useVault();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);
    setSelectedLicense('standard');

    titanApi
      .getProductBySlug(slug)
      .then((res) => {
        if (!active) return;
        setProduct(res.product);
        setRelated(res.related);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Product not found.');
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="h-[460px] animate-pulse rounded-2xl bg-white/5 lg:col-span-7" />
            <div className="h-[460px] animate-pulse rounded-2xl bg-white/5 lg:col-span-5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0F0B2E] pt-36 pb-24 text-center">
        <div className="mx-auto max-w-md px-4">
          <h1 className="font-display text-2xl font-bold text-white">Product Not Found</h1>
          <p className="mt-2 text-sm text-[#C7CEEA]">
            {error ?? 'This digital asset may have been moved or archived.'}
          </p>
          <Link
            to="/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const activePrice = getLicenseUnitPrice(product.price, selectedLicense);
  const activeOriginalPrice = product.originalPrice
    ? getLicenseUnitPrice(product.originalPrice, selectedLicense)
    : undefined;
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#C7CEEA]">
          <Link to="/marketplace" className="hover:text-white">Marketplace</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/categories/${product.categorySlug}`} className="hover:text-white">
            {product.categoryName}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {/* Main 2-Column Split: Gallery & Specs Left, Sticky Purchase Module Right */}
        <div className="mt-6 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-violet-300/22 bg-[#181247]">
              <SafeImage
                src={product.image}
                alt={product.name}
                fallbackLabel={product.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            {/* Overview */}
            <section className="rounded-2xl titan-glass p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-white">Overview</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#C7CEEA] sm:text-base">
                {product.longDescription}
              </p>

              <h3 className="mt-8 font-display text-base font-semibold text-white">
                What&apos;s Included
              </h3>
              <ul className="mt-4 space-y-3">
                {product.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#C7CEEA]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A855F7]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 font-display text-base font-semibold text-white">
                Key Highlights
              </h3>
              <ul className="mt-4 space-y-2.5">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-[#C7CEEA]">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" aria-hidden="true" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Technical Specifications */}
            <section className="rounded-2xl titan-glass p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-white">Technical Details</h2>
              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-t border-violet-300/18 pt-3">
                  <dt className="text-xs text-[#C7CEEA]">Creator Studio</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{product.creator}</dd>
                </div>
                <div className="border-t border-violet-300/18 pt-3">
                  <dt className="text-xs text-[#C7CEEA]">Package Format</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{product.fileFormat}</dd>
                </div>
                <div className="border-t border-violet-300/18 pt-3">
                  <dt className="text-xs text-[#C7CEEA]">Archive Size</dt>
                  <dd className="mt-1 font-mono text-sm font-medium tabular-nums text-white">
                    {product.fileSize}
                  </dd>
                </div>
                <div className="border-t border-violet-300/18 pt-3">
                  <dt className="text-xs text-[#C7CEEA]">Compatibility</dt>
                  <dd className="mt-1 text-sm font-medium text-white">
                    {product.compatibility.join(' · ')}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Right Column: Contiguous Sticky Purchase Module */}
          <aside className="lg:sticky lg:top-24 lg:col-span-5">
            <div className="rounded-2xl titan-glass-elevated p-6 sm:p-8">
              <div className="flex items-center justify-between gap-2 text-xs text-[#C7CEEA]">
                <span className="font-medium text-[#22D3EE]">{product.categoryName}</span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="text-white">{product.rating.toFixed(1)}</span>
                  <span>({product.reviewCount} reviews)</span>
                </span>
              </div>

              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">{product.tagline}</p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3 border-y border-violet-300/18 py-5">
                <span className="font-mono text-3xl font-bold tabular-nums text-white">
                  ${activePrice}
                </span>
                {activeOriginalPrice && activeOriginalPrice > activePrice && (
                  <span className="font-mono text-base tabular-nums text-[#C7CEEA]/70 line-through">
                    ${activeOriginalPrice}
                  </span>
                )}
                <span className="ml-auto text-xs text-[#C7CEEA]">One-time payment</span>
              </div>

              {/* License Tier Selector */}
              <div className="mt-6">
                <p className="text-xs font-semibold tracking-wide text-white">Select License Tier</p>
                <div className="mt-3 space-y-2.5">
                  {LICENSE_TIERS.map((tier) => {
                    const tierInfo = LICENSE_LABELS[tier];
                    const tierPrice = getLicenseUnitPrice(product.price, tier);
                    const active = selectedLicense === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedLicense(tier)}
                        className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#22D3EE] bg-[#7C3AED]/25'
                            : 'border-violet-300/22 bg-white/3 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{tierInfo.name}</p>
                          <p className="mt-0.5 text-xs text-[#C7CEEA]">{tierInfo.seats}</p>
                        </div>
                        <span className="font-mono text-sm font-semibold tabular-nums text-white">
                          ${tierPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => addToVault(product, selectedLicense, true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Add to Vault — ${activePrice}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    wishlisted
                      ? 'border-[#22D3EE]/60 bg-[#7C3AED]/25 text-white'
                      : 'border-violet-300/25 bg-white/4 text-[#C7CEEA] hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? 'fill-[#F472B6] text-[#22D3EE]' : ''}`} />
                  {wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                </button>
              </div>

              {/* Delivery Guarantees */}
              <ul className="mt-6 space-y-2.5 border-t border-violet-300/18 pt-5 text-xs text-[#C7CEEA]">
                <li className="flex items-center gap-2.5">
                  <Download className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" />
                  Instant digital download &amp; license key generation
                </li>
                <li className="flex items-center gap-2.5">
                  <FileCode2 className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" />
                  {LICENSE_LABELS[selectedLicense].rights}
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-violet-300/18 pt-14">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-white">
                Related Digital Assets
              </h2>
              <Link to="/marketplace" className="text-sm font-semibold text-[#22D3EE] hover:text-white">
                View catalog
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
