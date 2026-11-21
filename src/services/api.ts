import type {
  Category,
  Collection,
  LicenseTier,
  MarketplaceStats,
  Order,
  Product,
  UserProfile,
  VaultItem,
} from '../types/marketplace';

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return data as T;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export const titanApi = {
  getStats: () => request<MarketplaceStats>('/api/stats'),

  getProducts: (params: ProductQueryParams = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.category && params.category !== 'all') qs.set('category', params.category);
    if (params.sort) qs.set('sort', params.sort);
    if (params.minPrice !== undefined && params.minPrice > 0) qs.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice < 1000) qs.set('maxPrice', String(params.maxPrice));
    if (params.featured) qs.set('featured', 'true');
    const query = qs.toString();
    return request<{ products: Product[]; total: number }>(`/api/products${query ? `?${query}` : ''}`);
  },

  getProductBySlug: (slug: string) =>
    request<{ product: Product; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`),

  getCategories: () => request<{ categories: Category[] }>('/api/categories'),

  getCategoryBySlug: (slug: string) =>
    request<{ category: Category; products: Product[] }>(`/api/categories/${encodeURIComponent(slug)}`),

  getCollections: () => request<{ collections: Collection[] }>('/api/collections'),

  getCollectionBySlug: (slug: string) =>
    request<{ collection: Collection }>(`/api/collections/${encodeURIComponent(slug)}`),

  // Auth
  register: (payload: { name: string; email: string; password: string; company?: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/register', { method: 'POST', body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/api/auth/login', { method: 'POST', body: payload }),

  getMe: (token: string) => request<{ user: UserProfile }>('/api/auth/me', { token }),

  updateProfile: (token: string, payload: { name: string; company?: string; bio?: string }) =>
    request<{ user: UserProfile }>('/api/auth/profile', { method: 'PATCH', body: payload, token }),

  // Wishlist sync
  getWishlist: (token: string) => request<{ productIds: string[] }>('/api/wishlist', { token }),

  syncWishlist: (token: string, productIds: string[]) =>
    request<{ productIds: string[] }>('/api/wishlist', {
      method: 'PUT',
      body: { productIds },
      token,
    }),

  // Vault sync
  getVault: (token: string) => request<{ items: VaultItem[] }>('/api/vault', { token }),

  syncVault: (
    token: string,
    items: Array<{ productId: string; license: LicenseTier; quantity: number }>
  ) =>
    request<{ items: VaultItem[] }>('/api/vault', {
      method: 'PUT',
      body: { items },
      token,
    }),

  // Checkout & Orders
  validatePromo: (code: string) =>
    request<{ code: string; discountPercent: number; description: string }>('/api/checkout/validate-promo', {
      method: 'POST',
      body: { code },
    }),

  createOrder: (
    payload: {
      customerName: string;
      customerEmail: string;
      billingCountry: string;
      paymentMethod: string;
      promoCode?: string;
      items: Array<{ productId: string; license: LicenseTier; quantity: number }>;
    },
    token?: string | null
  ) => request<{ order: Order }>('/api/orders', { method: 'POST', body: payload, token }),

  getOrders: (token: string) => request<{ orders: Order[] }>('/api/orders', { token }),

  // Newsletter & Contact
  subscribeNewsletter: (email: string) =>
    request<{ ok: boolean; alreadySubscribed: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: { email },
    }),

  sendContactMessage: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ ok: boolean; ticketId: string; message: string }>('/api/contact', {
      method: 'POST',
      body: payload,
    }),
};
