import React, { createContext, useContext } from 'react';
import { Product, CartItem, Order, Drop } from '@/types/store';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  isCartOpen: boolean;
  brandLogo: string | null;
  activeDrop: (Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) | null;
  drops: (Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' })[];
  loading: boolean;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  getCartTotal: () => number;
  setBrandLogo: (logo: string) => void;
  getVisibleProducts: () => Product[];
  getDropProducts: (dropId: string) => Product[];
  createDrop: (drop: Omit<Drop, 'id' | 'isActive'> & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) => Promise<(Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) | null>;
  updateDrop: (id: string, updates: Partial<Drop> & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) => Promise<void>;
  cancelDrop: (id: string) => Promise<void>;
  completeDrop: () => Promise<void>;
  uploadMedia: (file: File, folder?: string) => Promise<string | null>;
  refreshProducts: () => Promise<void>;
  refreshDrops: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useSupabaseStore();

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}