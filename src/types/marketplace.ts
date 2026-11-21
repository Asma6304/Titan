export type LicenseTier = 'standard' | 'team' | 'enterprise';

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  image: string;
  creator: string;
  featured: boolean;
  createdAt: string;
  fileFormat: string;
  fileSize: string;
  compatibility: string[];
  deliverables: string[];
  highlights: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  accent: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  productSlugs: string[];
  bundleDiscountPercent: number;
  products?: Product[];
}

export interface VaultItem {
  productId: string;
  slug: string;
  name: string;
  categoryName: string;
  image: string;
  basePrice: number;
  license: LicenseTier;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'creator';
  company?: string;
  bio?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  license: LicenseTier;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  licenseKey: string;
  downloadLabel: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  billingCountry: string;
  paymentMethod: string;
  paymentMode: 'test';
  status: 'Completed' | 'Processing';
  promoCode?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface MarketplaceStats {
  totalProductsDisplay: number;
  happyCustomersDisplay: number;
  creatorsDisplay: number;
  reliabilityDisplay: number;
  liveCatalogCount: number;
  liveOrderCount: number;
}

export const LICENSE_MULTIPLIERS: Record<LicenseTier, number> = {
  standard: 1,
  team: 2.2,
  enterprise: 4.5,
};

export const LICENSE_LABELS: Record<LicenseTier, { name: string; seats: string; rights: string }> = {
  standard: {
    name: 'Standard License',
    seats: '1 user · 1 commercial project',
    rights: 'Lifetime updates & source access for an individual builder.',
  },
  team: {
    name: 'Team License',
    seats: 'Up to 10 seats · Unlimited client projects',
    rights: 'Shared repository access and commercial agency distribution.',
  },
  enterprise: {
    name: 'Enterprise License',
    seats: 'Unlimited seats · SaaS & organization-wide',
    rights: 'Full organizational rights, priority onboarding, and custom SLA.',
  },
};

export function getLicenseUnitPrice(basePrice: number, license: LicenseTier): number {
  return Math.round(basePrice * LICENSE_MULTIPLIERS[license]);
}
