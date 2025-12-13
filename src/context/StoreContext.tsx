import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order } from '@/types/store';

import hoodieDragon from '@/assets/products/hoodie-dragon.png';
import pantsKanji from '@/assets/products/pants-kanji.png';
import teeWolf from '@/assets/products/tee-wolf.png';
import jacketSakura from '@/assets/products/jacket-sakura.png';
import beanieWave from '@/assets/products/beanie-wave.png';
import bagEye from '@/assets/products/bag-eye.png';

const initialProducts: Product[] = [
  {
    id: '1',
    title: 'dragon spirit hoodie',
    price: 8500,
    images: [hoodieDragon],
    sizes: ['s', 'm', 'l', 'xl'],
    stock: 12,
    category: 'tops',
    description: 'premium heavyweight cotton / dragon embroidery / oversized fit',
  },
  {
    id: '2',
    title: 'kanji cargo pants',
    price: 6500,
    originalPrice: 9500,
    images: [pantsKanji],
    sizes: ['s', 'm', 'l', 'xl', 'xxl'],
    stock: 8,
    category: 'bottoms',
    description: 'wide leg fit / kanji print / elastic waist',
  },
  {
    id: '3',
    title: 'okami signature tee',
    price: 3500,
    images: [teeWolf],
    sizes: ['s', 'm', 'l', 'xl'],
    stock: 25,
    category: 'tops',
    description: '100% cotton / wolf graphic / relaxed fit',
  },
  {
    id: '4',
    title: 'sakura bomber jacket',
    price: 12500,
    images: [jacketSakura],
    sizes: ['m', 'l', 'xl'],
    stock: 5,
    category: 'outerwear',
    description: 'satin finish / sakura embroidery / zip closure',
  },
  {
    id: '5',
    title: 'kanagawa wave beanie',
    price: 2500,
    images: [beanieWave],
    sizes: ['one size'],
    stock: 30,
    category: 'accessories',
    description: 'acrylic knit / embroidered wave / cuffed style',
  },
  {
    id: '6',
    title: 'anime eye crossbody',
    price: 4500,
    originalPrice: 5500,
    images: [bagEye],
    sizes: ['one size'],
    stock: 0,
    category: 'accessories',
    description: 'canvas material / adjustable strap / zip closure',
  },
];

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  isCartOpen: boolean;
  brandLogo: string | null;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getCartTotal: () => number;
  setBrandLogo: (logo: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'okami2024';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('okami-products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('okami-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('okami-orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('okami-admin') === 'true';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [brandLogo, setBrandLogo] = useState<string | null>(() => {
    return localStorage.getItem('okami-brand-logo');
  });

  useEffect(() => {
    localStorage.setItem('okami-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('okami-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('okami-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('okami-admin', isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    if (brandLogo) {
      localStorage.setItem('okami-brand-logo', brandLogo);
    } else {
      localStorage.removeItem('okami-brand-logo');
    }
  }, [brandLogo]);

  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateCartQuantity = (
    productId: string,
    size: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const loginAdmin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setIsAdmin(false);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        isAdmin,
        isCartOpen,
        brandLogo,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setIsCartOpen,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        getCartTotal,
        setBrandLogo,
      }}
    >
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
