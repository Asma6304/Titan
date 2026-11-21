import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { titanApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'titan_wishlist_v1';

interface WishlistContextValue {
  productIds: string[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readStoredWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>(() => readStoredWishlist());
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [productIds]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    titanApi.syncWishlist(token, productIds).catch(() => {
      // Non-blocking sync
    });
  }, [productIds, token, isAuthenticated]);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      setProductIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Removed from Wishlist', {
            description: productName,
            tone: 'info',
          });
          return prev.filter((id) => id !== productId);
        }
        showToast('Saved to Wishlist', {
          description: productName,
          tone: 'success',
        });
        return [productId, ...prev];
      });
    },
    [showToast]
  );

  const clearWishlist = useCallback(() => {
    setProductIds([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        productIds,
        count: productIds.length,
        isWishlisted,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
