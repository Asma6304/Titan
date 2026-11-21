import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  GraduationCap,
  Headphones,
  Layers,
  LayoutTemplate,
  Lock,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { Category, Collection, MarketplaceStats, Product } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useVault } from '../context/VaultContext';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

const HERO_BG = '/src/assets/images/hero_titan_environment_1795284945902.jpg';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Code2,
  Cpu,
  LayoutTemplate,
  GraduationCap,
  Palette,
};

const CATEGORY_BADGE_STYLES = [
  'from-[#8B5CF6] to-[#6366F1] shadow-[0_8px_22px_-6px_rgba(139,92,246,0.65)]',
  'from-[#06B6D4] to-[#2563EB] shadow-[0_8px_22px_-6px_rgba(6,182,212,0.6)]',
  'from-[#EC4899] to-[#8B5CF6] shadow-[0_8px_22px_-6px_rgba(236,72,153,0.6)]',
  'from-[#3B82F6] to-[#4F46E5] shadow-[0_8px_22px_-6px_rgba(59,130,246,0.6)]',
  'from-[#10B981] to-[#06B6D4] shadow-[0_8px_22px_-6px_rgba(16,185,129,0.55)]',
  'from-[#F59E0B] to-[#EC4899] shadow-[0_8px_22px_-6px_rgba(245,158,11,0.55)]',
];

const WHY_TITAN = [
  {
    icon: ShieldCheck,
    accent: 'from-[#8B5CF6] to-[#4F46E5]',
    title: 'Premium Quality Products',
    description: 'Every UI system, codebase, and course passes strict engineering and visual craft reviews before listing.',
  },
  {
    icon: Lock,
    accent: 'from-[#06B6D4] to-[#2563EB]',
    title: 'Secure Payments',
    description: 'Server-verified pricing, transparent commercial licensing, and encrypted checkout architecture.',
  },
  {
    icon: Zap,
    accent: 'from-[#EC4899] to-[#8B5CF6]',
    title: 'Instant Digital Access',
    description: 'Receive your license keys and direct download packages immediately inside your TITAN dashboard.',
  },
  {
    icon: CheckCircle2,
    accent: 'from-[#10B981] to-[#06B6D4]',
    title: 'Verified Digital Resources',
    description: 'Clean TypeScript, organized Figma variables, and audited source files built by proven studios.',
  },
  {
    icon: Sparkles,
    accent: 'from-[#6366F1] to-[#06B6D4]',
    title: 'Seamless Shopping Experience',
    description: 'Save favorites to your Wishlist, manage multi-tier licenses in your Vault, and check out in seconds.',
  },
  {
    icon: Headphones,
    accent: 'from-[#F59E0B] to-[#EC4899]',
    title: 'Dedicated Customer Support',
    description: 'Direct assistance for licensing upgrades, team onboarding, and technical resource questions.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    accent: 'from-[#C084FC] to-[#6366F1]',
    title: 'Discover',
    description: 'Explore thousands of curated digital products across UI/UX systems, AI tools, templates, and courses.',
  },
  {
    step: '02',
    accent: 'from-[#22D3EE] to-[#3B82F6]',
    title: 'Add to Vault',
    description: 'Select the right license tier and collect your preferred digital assets inside your persistent TITAN Vault.',
  },
  {
    step: '03',
    accent: 'from-[#F472B6] to-[#8B5CF6]',
    title: 'Access',
    description: 'Complete checkout to immediately unlock lifetime downloads, updates, and verified license keys.',
  },
];

const SAMPLE_TESTIMONIALS = [
  {
    initials: 'ER',
    avatarGradient: 'from-[#8B5CF6] to-[#06B6D4]',
    name: 'Elena Rostova',
    role: 'Principal Product Designer',
    company: 'Arcadia Cloud (Sample)',
    rating: 5,
    quote:
      'Before TITAN, our design and engineering teams spent six weeks reconciling tokens. Adopting the Premium UI Design System cut our new dashboard delivery timeline in half.',
  },
  {
    initials: 'MK',
    avatarGradient: 'from-[#EC4899] to-[#8B5CF6]',
    name: 'Marcus Sterling',
    role: 'VP of Engineering',
    company: 'Veridian Labs (Sample)',
    rating: 5,
    quote:
      'The AI Coding Assistant and Full-Stack CLI Starter integrated cleanly into our TypeScript monorepo on day one. Zero fluff, clean documentation, and instant team access.',
  },
  {
    initials: 'PN',
    avatarGradient: 'from-[#06B6D4] to-[#4F46E5]',
    name: 'Priya Nair',
    role: 'Founder & Creative Director',
    company: 'Studio Kinetik (Sample)',
    rating: 5,
    quote:
      'Using the Creative Studio collection let us launch three client flagships in a single quarter with cohesive high-contrast polish and consistent 99+ Lighthouse scores.',
  },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const { showToast } = useToast();
  const { addToVault } = useVault();

  // Cursor-reactive hero parallax coordinates (-0.5 to 0.5)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });

  const orbLeftX = useTransform(smoothX, [-0.5, 0.5], [-26, 26]);
  const orbLeftY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const orbRightX = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const orbRightY = useTransform(smoothY, [-0.5, 0.5], [22, -22]);
  const heroCardX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const heroCardY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const heroSubCardX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const heroSubCardY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(nx);
    pointerY.set(ny);
  };

  const handleHeroMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      titanApi.getProducts({ featured: true }),
      titanApi.getCategories(),
      titanApi.getCollections(),
      titanApi.getStats(),
    ])
      .then(([prodRes, catRes, colRes, statsRes]) => {
        if (!active) return;
        setFeaturedProducts(prodRes.products);
        setCategories(catRes.categories);
        setCollections(colRes.collections);
        setStats(statsRes);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      showToast('Please enter a valid email address', { tone: 'error' });
      return;
    }
    setNewsletterSubmitting(true);
    setNewsletterMessage(null);
    try {
      const res = await titanApi.subscribeNewsletter(trimmed);
      setNewsletterMessage(res.message);
      setNewsletterEmail('');
      showToast('Newsletter updated', { description: res.message, tone: 'success' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Subscription failed', { tone: 'error' });
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const heroPrimaryCard = featuredProducts[0];
  const heroSecondaryCard = featuredProducts[1];

  return (
    <div className="bg-[#0F0B2E]">
      {/* HERO SECTION (Cursor-reactive parallax + floating showcase) */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28"
      >
        {/* Vibrant Deep Indigo Environment & Cursor-Reactive Ambient Gradients */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <SafeImage
            src={HERO_BG}
            alt=""
            className="h-full w-full object-cover object-center opacity-55 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#170F4F]/92 via-[#110C38]/82 to-[#0B1740]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0B2E] via-transparent to-[#0F0B2E]/50" />

          {/* Cursor-parallax + gentle breathing aurora orbs */}
          <motion.div
            style={{ x: orbLeftX, y: orbLeftY }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-24 top-12 h-[28rem] w-[28rem] rounded-full bg-[#7C3AED]/38 blur-[130px] will-change-transform"
          />
          <motion.div
            style={{ x: orbRightX, y: orbRightY }}
            animate={{ scale: [1.05, 0.96, 1.05] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-[#06B6D4]/28 blur-[130px] will-change-transform"
          />
          <motion.div
            style={{ x: orbLeftX, y: orbRightY }}
            animate={{ scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-[#EC4899]/24 blur-[120px] will-change-transform"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="lg:col-span-7"
            >
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
                className="text-xs font-semibold tracking-[0.22em] text-[#22D3EE] uppercase"
              >
                TITAN · The Digital Marketplace
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
                className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Discover. Explore.{' '}
                <span className="bg-gradient-to-r from-[#F5D0FE] via-[#A78BFA] to-[#22D3EE] bg-clip-text text-transparent">
                  Own the Digital Future.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 0.18, ease: EASE_OUT }}
                className="mt-6 max-w-xl text-base leading-relaxed text-[#D2D8F2] sm:text-lg"
              >
                Your destination for premium digital products, powerful development tools, creative resources and next-generation digital solutions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 0.24, ease: EASE_OUT }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white titan-glow-button whitespace-nowrap"
                  >
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-500/18 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-[#22D3EE]/70 hover:bg-violet-500/28 whitespace-nowrap"
                  >
                    Discover Collections
                  </Link>
                </motion.div>
              </motion.div>

              {/* Clean unboxed trust line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.34 }}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#D2D8F2]"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
                  Verified commercial licenses
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" />
                  Instant Vault access
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F472B6]" aria-hidden="true" />
                  Lifetime updates included
                </span>
              </motion.div>
            </motion.div>

            {/* Right Floating Product Preview Showcase with Cursor Parallax */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: EASE_OUT }}
              className="relative lg:col-span-5"
            >
              <div className="space-y-4">
                {heroPrimaryCard ? (
                  <motion.div
                    style={{ x: heroCardX, y: heroCardY }}
                    className="will-change-transform"
                  >
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="overflow-hidden rounded-2xl titan-glass-elevated p-4"
                    >
                      <Link
                        to={`/product/${heroPrimaryCard.slug}`}
                        className="block overflow-hidden rounded-xl ring-1 ring-violet-300/20"
                      >
                        <SafeImage
                          src={heroPrimaryCard.image}
                          alt={heroPrimaryCard.name}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
                        />
                      </Link>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#22D3EE]">{heroPrimaryCard.categoryName}</p>
                          <Link
                            to={`/product/${heroPrimaryCard.slug}`}
                            className="mt-0.5 block truncate font-display text-base font-semibold text-white hover:text-[#E879F9]"
                          >
                            {heroPrimaryCard.name}
                          </Link>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => addToVault(heroPrimaryCard, 'standard', true)}
                          className="shrink-0 rounded-lg px-3.5 py-2 font-mono text-xs font-semibold tabular-nums text-white titan-glow-button cursor-pointer"
                        >
                          ${heroPrimaryCard.price} · Vault
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="h-64 animate-pulse rounded-2xl bg-violet-400/12" />
                )}

                {heroSecondaryCard && (
                  <motion.div
                    style={{ x: heroSubCardX, y: heroSubCardY }}
                    className="will-change-transform"
                  >
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center gap-4 rounded-2xl titan-glass-elevated p-3.5 sm:ml-8"
                    >
                      <Link
                        to={`/product/${heroSecondaryCard.slug}`}
                        className="h-16 w-22 shrink-0 overflow-hidden rounded-lg border border-violet-300/25"
                      >
                        <SafeImage
                          src={heroSecondaryCard.image}
                          alt={heroSecondaryCard.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[#C7CEEA]">
                          {heroSecondaryCard.categoryName} ·{' '}
                          <span className="text-amber-300">{heroSecondaryCard.rating.toFixed(1)} ★</span>
                        </p>
                        <Link
                          to={`/product/${heroSecondaryCard.slug}`}
                          className="mt-0.5 block truncate font-display text-sm font-semibold text-white hover:text-[#22D3EE]"
                        >
                          {heroSecondaryCard.name}
                        </Link>
                      </div>
                      <span className="font-mono text-sm font-bold tabular-nums text-[#22D3EE]">
                        ${heroSecondaryCard.price}
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* TRUST & STATISTICS STRIP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mt-16 grid grid-cols-2 gap-4 rounded-2xl titan-glass p-6 sm:grid-cols-4 sm:gap-6 sm:p-8"
          >
            <div className="space-y-1">
              <p className="bg-gradient-to-r from-white to-[#C084FC] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                <AnimatedCounter end={stats?.totalProductsDisplay ?? 10000} suffix="+" />
              </p>
              <p className="text-xs font-medium text-[#C7CEEA] sm:text-sm">Digital Products</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-violet-300/20 sm:pl-6">
              <p className="bg-gradient-to-r from-white to-[#22D3EE] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                <AnimatedCounter end={stats?.happyCustomersDisplay ?? 5000} suffix="+" />
              </p>
              <p className="text-xs font-medium text-[#C7CEEA] sm:text-sm">Happy Customers</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-violet-300/20 sm:pl-6">
              <p className="bg-gradient-to-r from-white to-[#F472B6] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                <AnimatedCounter end={stats?.creatorsDisplay ?? 500} suffix="+" />
              </p>
              <p className="text-xs font-medium text-[#C7CEEA] sm:text-sm">Verified Creators</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-violet-300/20 sm:pl-6">
              <p className="bg-gradient-to-r from-white to-[#34D399] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                <AnimatedCounter end={stats?.reliabilityDisplay ?? 99.9} decimals={1} suffix="%" />
              </p>
              <p className="text-xs font-medium text-[#C7CEEA] sm:text-sm">Platform Reliability</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="relative border-t border-violet-400/18 bg-gradient-to-b from-[#151042] to-[#120D38] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#22D3EE] uppercase">
                Browse by discipline
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Featured Categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#22D3EE] transition-colors hover:text-white"
            >
              View all categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? Layers;
              const badgeStyle = CATEGORY_BADGE_STYLES[idx % CATEGORY_BADGE_STYLES.length];
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.42, delay: idx * 0.055, ease: EASE_OUT }}
                >
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl titan-glass p-6 titan-card-hover"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${badgeStyle}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-[#C7CEEA]">
                          {cat.productCount} {cat.productCount === 1 ? 'asset' : 'assets'}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold text-white transition-colors group-hover:text-[#22D3EE]">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E0E7FF] transition-colors group-hover:text-[#22D3EE]">
                      Explore category
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="border-t border-violet-400/18 bg-[#0F0B2E] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#E879F9] uppercase">
                Flagship releases
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Featured Digital Products
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#22D3EE] transition-colors hover:text-white"
            >
              Browse full marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-[420px] animate-pulse rounded-2xl bg-violet-400/10" />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.45, delay: (idx % 3) * 0.07, ease: EASE_OUT }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CURATED COLLECTIONS */}
      <section className="border-t border-violet-400/18 bg-gradient-to-b from-[#161046] to-[#110C36] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#22D3EE] uppercase">
                Curated bundles
              </p>
              <h2
                className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                Curated For Your Next Big Idea
              </h2>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#22D3EE] transition-colors hover:text-white"
            >
              Explore all collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {collections.map((col, idx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.48, delay: idx * 0.08, ease: EASE_OUT }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl titan-glass titan-card-hover"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1B1452]">
                  <SafeImage
                    src={col.image}
                    alt={col.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0F0B2E] via-[#130D3C]/65 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs font-semibold text-[#22D3EE]">
                      {col.subtitle} · {col.productSlugs.length} digital products · Save {col.bundleDiscountPercent}%
                    </p>
                    <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
                      {col.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[#D2D8F2]">
                      {col.description}
                    </p>
                    <div className="mt-5">
                      <Link
                        to={`/collections/${col.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-violet-500/25 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-[#22D3EE] hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#06B6D4]"
                      >
                        Explore Collection
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE TITAN? */}
      <section className="border-t border-violet-400/18 bg-[#0F0B2E] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-[#E879F9] uppercase">
              Built for modern teams
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Choose TITAN?
            </h2>
            <p className="mt-3 text-base text-[#C7CEEA]">
              Engineered to eliminate friction between discovering premium digital assets and shipping them into production.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_TITAN.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.42, delay: idx * 0.055, ease: EASE_OUT }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl titan-glass p-6 transition-colors hover:border-violet-300/40"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${item.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-violet-400/18 bg-gradient-to-b from-[#161046] to-[#110C36] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-[#22D3EE] uppercase">
              Simple workflow
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How TITAN Works
            </h2>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.46, delay: idx * 0.1, ease: EASE_OUT }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl titan-glass p-7 transition-colors hover:border-[#22D3EE]/40"
              >
                <span
                  className={`bg-gradient-to-r bg-clip-text font-mono text-lg font-bold text-transparent ${step.accent}`}
                >
                  {step.step}.
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#C7CEEA]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-violet-400/18 bg-[#0F0B2E] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#E879F9] uppercase">
                Sample Customer Stories (Demo)
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for Builders &amp; Studios
              </h2>
            </div>
            <p className="text-xs text-[#C7CEEA]">
              Illustrative demo testimonials for marketplace preview
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {SAMPLE_TESTIMONIALS.map((t, idx) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: EASE_OUT }}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-2xl titan-glass p-6 transition-colors hover:border-violet-300/35"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, starIdx) => (
                      <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-white/95">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="mt-6 flex items-center gap-3.5 border-t border-violet-300/18 pt-4">
                  <div
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-xs font-bold text-white shadow-md ${t.avatarGradient}`}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{t.name}</p>
                    <p className="truncate text-xs text-[#C7CEEA]">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="border-t border-violet-400/18 bg-gradient-to-b from-[#151042] to-[#0F0B2E] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="relative overflow-hidden rounded-3xl border border-violet-300/30 bg-gradient-to-br from-[#24186B] via-[#1A1354] to-[#111B4C] p-8 shadow-[0_28px_70px_-20px_rgba(124,58,237,0.5)] sm:p-12"
          >
            <motion.div
              aria-hidden="true"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.38, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#06B6D4]/28 blur-[100px]"
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.22, 0.35, 0.22] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#EC4899]/24 blur-[100px]"
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2
                className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                Stay Ahead of the Digital Curve
              </h2>
              <p className="mt-3 text-base text-[#D2D8F2]">
                Get updates about new digital products, exclusive collections and the latest marketplace releases.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="flex-1 rounded-xl border border-violet-300/30 bg-[#0D0928]/85 px-4 py-3 text-sm text-white placeholder-[#C7CEEA]/65 focus:border-[#22D3EE] focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={newsletterSubmitting}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white titan-glow-button disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </motion.button>
              </form>

              {newsletterMessage && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {newsletterMessage}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
