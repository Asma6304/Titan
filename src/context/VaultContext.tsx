import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLicenseUnitPrice, type LicenseTier, type Product, type VaultItem } from '../types/marketplace';
import { titanApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'titan_vault_v1';

interface VaultContextValue {
  items: VaultItem[];
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToVault: (product: Product, license?: LicenseTier, openAfter?: boolean) => void;
  addBundleToVault: (products: Product[], bundleName: string) => void;
  removeFromVault: (productId: string, license: LicenseTier) => void;
  updateQuantity: (productId: string, license: LicenseTier, quantity: number) => void;
  updateLicense: (productId: string, oldLicense: LicenseTier, newLicense: LicenseTier) => void;
  clearVault: () => void;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

function readStoredVault(): VaultItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<VaultItem[]>(() => readStoredVault());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Persist locally on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  // Sync with backend when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const payload = items.map((item) => ({
      productId: item.productId,
      license: item.license,
      quantity: item.quantity,
    }));
    titanApi.syncVault(token, payload).catch(() => {
      // Non-blocking sync
    });
  }, [items, token, isAuthenticated]);

  const addToVault = useCallback(
    (product: Product, license: LicenseTier = 'standard', openAfter = false) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.productId === product.id && i.license === license);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: Math.min(20, updated[idx].quantity + 1) };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            categoryName: product.categoryName,
            image: product.image,
            basePrice: product.price,
            license,
            quantity: 1,
          },
        ];
      });
      showToast('Added to your Vault', {
        description: `${product.name} (${license.charAt(0).toUpperCase() + license.slice(1)} License)`,
        tone: 'success',
      });
      if (openAfter) {
        setIsDrawerOpen(true);
      }
    },
    [showToast]
  );

  const addBundleToVault = useCallback(
    (products: Product[], bundleName: string) => {
      setItems((prev) => {
        const next = [...prev];
        for (const product of products) {
          const idx = next.findIndex((i) => i.productId === product.id && i.license === 'standard');
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: Math.min(20, next[idx].quantity + 1) };
          } else {
            next.push({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              categoryName: product.categoryName,
              image: product.image,
              basePrice: product.price,
              license: 'standard',
              quantity: 1,
            });
          }
        }
        return next;
      });
      showToast(`${bundleName} added to Vault`, {
        description: `${products.length} digital assets queued. Use code LAUNCH20 at checkout for 20% off.`,
        tone: 'success',
      });
      setIsDrawerOpen(true);
    },
    [showToast]
  );

  const removeFromVault = useCallback(
    (productId: string, license: LicenseTier) => {
      setItems((prev) => prev.filter((i) => !(i.productId === productId && i.license === license)));
      showToast('Removed from Vault', { tone: 'info' });
    },
    [showToast]
  );

  const updateQuantity = useCallback((productId: string, license: LicenseTier, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !(i.productId === productId && i.license === license)));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.license === license
          ? { ...i, quantity: Math.min(20, quantity) }
          : i
      )
    );
  }, []);

  const updateLicense = useCallback(
    (productId: string, oldLicense: LicenseTier, newLicense: LicenseTier) => {
      if (oldLicense === newLicense) return;
      setItems((prev) => {
        const current = prev.find((i) => i.productId === productId && i.license === oldLicense);
        if (!current) return prev;
        const existingTarget = prev.find((i) => i.productId === productId && i.license === newLicense);
        if (existingTarget) {
          return prev
            .filter((i) => !(i.productId === productId && i.license === oldLicense))
            .map((i) =>
              i.productId === productId && i.license === newLicense
                ? { ...i, quantity: Math.min(20, i.quantity + current.quantity) }
                : i
            );
        }
        return prev.map((i) =>
          i.productId === productId && i.license === oldLicense ? { ...i, license: newLicense } : i
        );
      });
    },
    []
  );

  const clearVault = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + getLicenseUnitPrice(i.basePrice, i.license) * i.quantity, 0),
    [items]
  );

  return (
    <VaultContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToVault,
        addBundleToVault,
        removeFromVault,
        updateQuantity,
        updateLicense,
        clearVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}
