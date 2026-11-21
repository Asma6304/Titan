import fs from 'fs';
import path from 'path';
import type { Category, Collection, Order, Product, UserProfile, VaultItem } from '../../src/types/marketplace.ts';
import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_PRODUCTS } from '../data/seedData.ts';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  products: Product[];
  categories: Category[];
  collections: Collection[];
  orders: Order[];
  wishlists: Record<string, string[]>;
  vaults: Record<string, VaultItem[]>;
  newsletterSubscribers: NewsletterSubscriber[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'titan-db.json');

function createInitialDb(): DatabaseSchema {
  return {
    users: [],
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
    collections: SEED_COLLECTIONS,
    orders: [],
    wishlists: {},
    vaults: {},
    newsletterSubscribers: [],
    contactMessages: [],
  };
}

class TitanStore {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
        // Always refresh canonical seed catalog items so new assets/updates reflect cleanly
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          products: SEED_PRODUCTS,
          categories: SEED_CATEGORIES,
          collections: SEED_COLLECTIONS,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          wishlists: parsed.wishlists && typeof parsed.wishlists === 'object' ? parsed.wishlists : {},
          vaults: parsed.vaults && typeof parsed.vaults === 'object' ? parsed.vaults : {},
          newsletterSubscribers: Array.isArray(parsed.newsletterSubscribers)
            ? parsed.newsletterSubscribers
            : [],
          contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
        };
      }
    } catch {
      // Fall back to fresh seeded database if file is unreadable
    }
    const initial = createInitialDb();
    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema = this.db): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpPath = `${DB_FILE}.${process.pid}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist TITAN store:', err);
    }
  }

  // Products
  getProducts(): Product[] {
    return this.db.products;
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.db.products.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this.db.products.find((p) => p.id === id);
  }

  // Categories
  getCategories(): Category[] {
    return this.db.categories.map((cat) => ({
      ...cat,
      productCount: this.db.products.filter((p) => p.categorySlug === cat.slug).length,
    }));
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories().find((c) => c.slug === slug);
  }

  // Collections
  getCollections(): Collection[] {
    return this.db.collections.map((col) => ({
      ...col,
      products: col.productSlugs
        .map((slug) => this.getProductBySlug(slug))
        .filter((p): p is Product => Boolean(p)),
    }));
  }

  getCollectionBySlug(slug: string): Collection | undefined {
    return this.getCollections().find((c) => c.slug === slug);
  }

  // Users
  findUserByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.db.users.find((u) => u.email.toLowerCase() === normalized);
  }

  findUserById(id: string): StoredUser | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  createUser(user: StoredUser): StoredUser {
    this.db.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, patch: Partial<Pick<StoredUser, 'name' | 'company' | 'bio'>>): StoredUser | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.company !== undefined) user.company = patch.company;
    if (patch.bio !== undefined) user.bio = patch.bio;
    this.persist();
    return user;
  }

  // Wishlist
  getWishlist(userId: string): string[] {
    return this.db.wishlists[userId] ?? [];
  }

  setWishlist(userId: string, productIds: string[]): string[] {
    const validIds = new Set(this.db.products.map((p) => p.id));
    const filtered = Array.from(new Set(productIds.filter((id) => validIds.has(id))));
    this.db.wishlists[userId] = filtered;
    this.persist();
    return filtered;
  }

  // Vault
  getVault(userId: string): VaultItem[] {
    return this.db.vaults[userId] ?? [];
  }

  setVault(userId: string, items: VaultItem[]): VaultItem[] {
    this.db.vaults[userId] = items;
    this.persist();
    return items;
  }

  // Orders
  createOrder(order: Order): Order {
    this.db.orders.unshift(order);
    this.persist();
    return order;
  }

  getOrdersByUser(userId: string): Order[] {
    return this.db.orders.filter((o) => o.userId === userId);
  }

  getOrderById(id: string): Order | undefined {
    return this.db.orders.find((o) => o.id === id);
  }

  getTotalOrdersCount(): number {
    return this.db.orders.length;
  }

  // Newsletter
  subscribeNewsletter(email: string): { subscriber: NewsletterSubscriber; alreadySubscribed: boolean } {
    const normalized = email.trim().toLowerCase();
    const existing = this.db.newsletterSubscribers.find((s) => s.email === normalized);
    if (existing) {
      return { subscriber: existing, alreadySubscribed: true };
    }
    const subscriber: NewsletterSubscriber = {
      id: `sub_${Date.now().toString(36)}`,
      email: normalized,
      subscribedAt: new Date().toISOString(),
    };
    this.db.newsletterSubscribers.push(subscriber);
    this.persist();
    return { subscriber, alreadySubscribed: false };
  }

  // Contact
  saveContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage {
    const saved: ContactMessage = {
      ...msg,
      id: `msg_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.contactMessages.unshift(saved);
    this.persist();
    return saved;
  }
}

export const titanStore = new TitanStore();
