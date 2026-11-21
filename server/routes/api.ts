import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  getLicenseUnitPrice,
  type LicenseTier,
  type MarketplaceStats,
  type Order,
  type OrderItem,
  type VaultItem,
} from '../../src/types/marketplace.ts';
import { PROMO_CODES } from '../data/seedData.ts';
import { titanStore } from '../db/store.ts';
import {
  hashPassword,
  optionalAuth,
  requireAuth,
  signAuthToken,
  toPublicUser,
  verifyPassword,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';

const router = Router();

// --- Zod Schemas ---

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email address').max(120),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
  company: z.string().trim().max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  company: z.string().trim().max(80).optional().default(''),
  bio: z.string().trim().max(300).optional().default(''),
});

const licenseTierSchema = z.enum(['standard', 'team', 'enterprise']);

const vaultSyncSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        license: licenseTierSchema,
        quantity: z.number().int().min(1).max(20),
      })
    )
    .max(50),
});

const wishlistSyncSchema = z.object({
  productIds: z.array(z.string().min(1)).max(100),
});

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Full name is required').max(100),
  customerEmail: z.string().trim().email('Valid email address is required').max(120),
  billingCountry: z.string().trim().min(2, 'Country is required').max(80),
  paymentMethod: z.enum(['Test Card (Visa •••• 4242)', 'Test Digital Wallet', 'Test Enterprise Invoice']),
  promoCode: z.string().trim().max(32).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        license: licenseTierSchema,
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, 'Your Vault is empty'),
});

const newsletterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(120),
});

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email address').max(120),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(120),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});

function generateLicenseKey(slug: string): string {
  const prefix = slug
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase();
  const block1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const block2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const block3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TITAN-${prefix}-${block1}-${block2}-${block3}`;
}

// --- Stats Endpoint ---

router.get('/stats', (_req: Request, res: Response) => {
  const stats: MarketplaceStats = {
    totalProductsDisplay: 10000,
    happyCustomersDisplay: 5000,
    creatorsDisplay: 500,
    reliabilityDisplay: 99.9,
    liveCatalogCount: titanStore.getProducts().length,
    liveOrderCount: titanStore.getTotalOrdersCount(),
  };
  res.json(stats);
});

// --- Products & Search Endpoints ---

router.get('/products', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'popular';
  const featured = req.query.featured === 'true';
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;

  let list = [...titanStore.getProducts()];

  if (featured) {
    list = list.filter((p) => p.featured);
  }

  if (category && category !== 'all') {
    list = list.filter((p) => p.categorySlug.toLowerCase() === category);
  }

  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.tagline.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search) ||
        p.creator.toLowerCase().includes(search)
    );
  }

  if (!Number.isNaN(minPrice)) {
    list = list.filter((p) => p.price >= minPrice);
  }
  if (!Number.isNaN(maxPrice) && maxPrice > 0) {
    list = list.filter((p) => p.price <= maxPrice);
  }

  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'popular':
    default:
      list.sort((a, b) => b.salesCount - a.salesCount);
      break;
  }

  res.json({ products: list, total: list.length });
});

router.get('/products/:slug', (req: Request, res: Response) => {
  const product = titanStore.getProductBySlug(req.params.slug);
  if (!product) {
    res.status(404).json({ error: 'Digital product not found.' });
    return;
  }
  const related = titanStore
    .getProducts()
    .filter((p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.featured))
    .slice(0, 3);

  res.json({ product, related });
});

// --- Categories & Collections ---

router.get('/categories', (_req: Request, res: Response) => {
  res.json({ categories: titanStore.getCategories() });
});

router.get('/categories/:slug', (req: Request, res: Response) => {
  const category = titanStore.getCategoryBySlug(req.params.slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  const products = titanStore.getProducts().filter((p) => p.categorySlug === category.slug);
  res.json({ category, products });
});

router.get('/collections', (_req: Request, res: Response) => {
  res.json({ collections: titanStore.getCollections() });
});

router.get('/collections/:slug', (req: Request, res: Response) => {
  const collection = titanStore.getCollectionBySlug(req.params.slug);
  if (!collection) {
    res.status(404).json({ error: 'Collection not found.' });
    return;
  }
  res.json({ collection });
});

// --- Authentication & User Management ---

router.post('/auth/register', (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid registration data.' });
    return;
  }

  const { name, email, password, company } = parsed.data;
  if (titanStore.findUserByEmail(email)) {
    res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    return;
  }

  const user = titanStore.createUser({
    id: `usr_${crypto.randomBytes(6).toString('hex')}`,
    name,
    email: email.toLowerCase(),
    role: 'member',
    company: company || '',
    bio: '',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });

  const token = signAuthToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid credentials.' });
    return;
  }

  const { email, password } = parsed.data;
  const user = titanStore.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signAuthToken(user);
  res.json({ token, user: toPublicUser(user) });
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

router.patch('/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid profile update.' });
    return;
  }

  const updated = titanStore.updateUser(req.user!.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }
  res.json({ user: toPublicUser(updated) });
});

// --- Wishlist Sync (Authenticated) ---

router.get('/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ids = titanStore.getWishlist(req.user!.id);
  res.json({ productIds: ids });
});

router.put('/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parsed = wishlistSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid wishlist payload.' });
    return;
  }
  const saved = titanStore.setWishlist(req.user!.id, parsed.data.productIds);
  res.json({ productIds: saved });
});

// --- Vault (Cart) Sync (Authenticated) ---

router.get('/vault', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const items = titanStore.getVault(req.user!.id);
  res.json({ items });
});

router.put('/vault', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parsed = vaultSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid vault payload.' });
    return;
  }

  const resolved: VaultItem[] = [];
  for (const entry of parsed.data.items) {
    const product = titanStore.getProductById(entry.productId);
    if (product) {
      resolved.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        categoryName: product.categoryName,
        image: product.image,
        basePrice: product.price,
        license: entry.license,
        quantity: entry.quantity,
      });
    }
  }

  const saved = titanStore.setVault(req.user!.id, resolved);
  res.json({ items: saved });
});

// --- Checkout & Promo Validation ---

router.post('/checkout/validate-promo', (req: Request, res: Response) => {
  const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  const match = PROMO_CODES[rawCode];
  if (!match) {
    res.status(404).json({ error: 'Promo code not recognized. Try TITAN15 or WELCOME10.' });
    return;
  }
  res.json({ code: rawCode, ...match });
});

// --- Orders (Server-Side Canonical Pricing) ---

router.post('/orders', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid checkout details.' });
    return;
  }

  const { customerName, customerEmail, billingCountry, paymentMethod, promoCode, items } = parsed.data;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const product = titanStore.getProductById(item.productId);
    if (!product) {
      res.status(400).json({ error: `Product "${item.productId}" is no longer available.` });
      return;
    }
    const unitPrice = getLicenseUnitPrice(product.price, item.license as LicenseTier);
    const lineTotal = unitPrice * item.quantity;
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      license: item.license,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      licenseKey: generateLicenseKey(product.slug),
      downloadLabel: `${product.slug}-release.zip (${product.fileSize})`,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const normalizedPromo = promoCode ? promoCode.trim().toUpperCase() : '';
  const promoRule = normalizedPromo ? PROMO_CODES[normalizedPromo] : undefined;
  const discount = promoRule ? Math.round((subtotal * promoRule.discountPercent) / 100) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.08 * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  const orderNumber = `TTN-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  const order: Order = {
    id: `ord_${crypto.randomBytes(6).toString('hex')}`,
    orderNumber,
    userId: req.user?.id ?? `guest:${customerEmail.toLowerCase()}`,
    customerName,
    customerEmail: customerEmail.toLowerCase(),
    billingCountry,
    paymentMethod,
    paymentMode: 'test',
    status: 'Completed',
    promoCode: promoRule ? normalizedPromo : undefined,
    subtotal,
    discount,
    tax,
    total,
    items: orderItems,
    createdAt: new Date().toISOString(),
  };

  titanStore.createOrder(order);

  if (req.user) {
    titanStore.setVault(req.user.id, []);
  }

  res.status(201).json({ order });
});

router.get('/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = titanStore.getOrdersByUser(req.user!.id);
  res.json({ orders });
});

router.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = titanStore.getOrderById(req.params.id);
  if (!order || order.userId !== req.user!.id) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json({ order });
});

// --- Newsletter & Contact ---

router.post('/newsletter', (req: Request, res: Response) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Please enter a valid email.' });
    return;
  }
  const { alreadySubscribed } = titanStore.subscribeNewsletter(parsed.data.email);
  res.status(201).json({
    ok: true,
    alreadySubscribed,
    message: alreadySubscribed
      ? 'You are already subscribed to TITAN release briefings.'
      : 'Subscribed! Welcome to TITAN release briefings.',
  });
});

router.post('/contact', (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Please complete all fields.' });
    return;
  }
  const saved = titanStore.saveContactMessage(parsed.data);
  res.status(201).json({
    ok: true,
    ticketId: saved.id,
    message: 'Your inquiry has been received. Our support team responds within 1 business day.',
  });
});

export default router;
