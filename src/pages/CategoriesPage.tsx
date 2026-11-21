import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Cpu,
  GraduationCap,
  Layers,
  LayoutTemplate,
  Palette,
} from 'lucide-react';
import type { Category, Product } from '../types/marketplace';
import { titanApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Code2,
  Cpu,
  LayoutTemplate,
  GraduationCap,
  Palette,
};

export function CategoriesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    if (slug) {
      Promise.all([titanApi.getCategories(), titanApi.getCategoryBySlug(slug)])
        .then(([allCats, catDetail]) => {
          if (!active) return;
          setCategories(allCats.categories);
          setActiveCategory(catDetail.category);
          setProducts(catDetail.products);
        })
        .catch(() => {
          if (active) setActiveCategory(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      Promise.all([titanApi.getCategories(), titanApi.getProducts({ sort: 'popular' })])
        .then(([allCats, prodRes]) => {
          if (!active) return;
          setCategories(allCats.categories);
          setActiveCategory(null);
          setProducts(prodRes.products);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {slug ? (
          <>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C7CEEA] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Categories
            </Link>
            <div className="mt-4 border-b border-violet-300/18 pb-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
                Category Archive
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                {activeCategory?.name ?? 'Category'}
              </h1>
              {activeCategory && (
                <p className="mt-2 max-w-2xl text-sm text-[#C7CEEA] sm:text-base">
                  {activeCategory.description}
                </p>
              )}
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[420px] animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-10 rounded-2xl titan-glass p-12 text-center">
                <p className="text-white">No digital assets in this category yet.</p>
                <Link
                  to="/marketplace"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white titan-glow-button"
                >
                  Browse full marketplace
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="border-b border-violet-300/18 pb-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
                Explore by Specialty
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Marketplace Categories
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#C7CEEA] sm:text-base">
                Six focused disciplines spanning interface systems, AI utilities, engineering starters, templates, courses, and 3D creative kits.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon] ?? Layers;
                return (
                  <Link
                    key={cat.slug}
                    to={`/categories/${cat.slug}`}
                    className="group flex flex-col justify-between rounded-2xl titan-glass p-7 titan-card-hover"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-300/22 bg-[#181247] text-[#22D3EE] group-hover:border-[#22D3EE]/60 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-[#C7CEEA]">
                          {cat.productCount} products
                        </span>
                      </div>
                      <h2 className="mt-5 font-display text-xl font-semibold text-white group-hover:text-[#22D3EE]">
                        {cat.name}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">
                        {cat.description}
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                      Explore category
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
