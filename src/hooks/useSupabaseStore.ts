import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Drop, Order, CartItem } from '@/types/store';
import { toast } from 'sonner';

interface DbProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
  sizes: string[];
  stock: number;
  category: 'tops' | 'bottoms' | 'outerwear' | 'accessories';
  description: string | null;
  drop_id: string | null;
  is_new: boolean;
  has_fire_effect: boolean;
  sold_out_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbDrop {
  id: string;
  name: string;
  release_date: string;
  lookbook_images: string[];
  background_url: string | null;
  background_type: 'image' | 'gif' | 'video';
  is_active: boolean;
  global_fire_effect: boolean;
  created_at: string;
  updated_at: string;
}

interface DbOrder {
  id: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  delivery_type: 'home' | 'desk';
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

function mapDbToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    title: db.title,
    price: db.price,
    originalPrice: db.original_price || undefined,
    images: db.images,
    sizes: db.sizes,
    stock: db.stock,
    category: db.category,
    description: db.description || undefined,
    dropId: db.drop_id || undefined,
    isNew: db.is_new,
    hasFireEffect: db.has_fire_effect,
  };
}

function mapDbToDrop(db: DbDrop): Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' } {
  return {
    id: db.id,
    name: db.name,
    releaseDate: new Date(db.release_date),
    lookbookImages: db.lookbook_images,
    backgroundImage: db.background_url || undefined,
    backgroundUrl: db.background_url || undefined,
    backgroundType: db.background_type,
    isActive: db.is_active,
    globalFireEffect: db.global_fire_effect,
    productIds: [], // Will be populated separately
  };
}

function mapDbToOrder(db: DbOrder): Order {
  return {
    id: db.id,
    customerName: db.customer_name,
    phone: db.phone,
    wilaya: db.wilaya,
    deliveryType: db.delivery_type,
    items: db.items,
    total: db.total,
    status: db.status,
    createdAt: new Date(db.created_at),
  };
}

// Secure admin token storage
const ADMIN_TOKEN_KEY = 'okami-admin-token';

function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function callAdminFunction(action: string, data?: Record<string, unknown>, requiresAuth = true) {
  const headers: Record<string, string> = {};
  
  if (requiresAuth) {
    const token = getAdminToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const response = await supabase.functions.invoke('admin', {
    body: { action, data },
    headers,
  });
  
  if (response.error) throw response.error;
  return response.data;
}

export function useSupabaseStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drops, setDrops] = useState<(Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('okami-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [brandLogo, setBrandLogo] = useState<string | null>(() => {
    return localStorage.getItem('okami-brand-logo');
  });
  const [loading, setLoading] = useState(true);

  // Verify admin token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = getAdminToken();
      if (token) {
        try {
          await callAdminFunction('verify_token', {}, true);
          setIsAdmin(true);
        } catch {
          // Token invalid or expired
          setAdminToken(null);
          setIsAdmin(false);
        }
      }
    };
    verifyToken();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchDrops();
  }, []);

  // Fetch orders when admin status changes
  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('okami-cart', JSON.stringify(cart));
  }, [cart]);

  // Persist brand logo
  useEffect(() => {
    if (brandLogo) {
      localStorage.setItem('okami-brand-logo', brandLogo);
    } else {
      localStorage.removeItem('okami-brand-logo');
    }
  }, [brandLogo]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts((data as DbProduct[]).map(mapDbToProduct));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedDrops = (data as DbDrop[]).map(mapDbToDrop);
      
      // Get product IDs for each drop
      for (const drop of mappedDrops) {
        const dropProducts = products.filter(p => p.dropId === drop.id);
        drop.productIds = dropProducts.map(p => p.id);
      }
      
      setDrops(mappedDrops);
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const result = await callAdminFunction('get_orders');
      if (result.orders) {
        setOrders((result.orders as DbOrder[]).map(mapDbToOrder));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Auth functions
  const loginAdmin = async (password: string): Promise<boolean> => {
    try {
      const result = await callAdminFunction('verify_password', { password }, false);
      if (result.success && result.token) {
        setAdminToken(result.token);
        setIsAdmin(true);
        fetchOrders();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      await callAdminFunction('logout', {}, true);
    } catch {
      // Ignore logout errors
    }
    setAdminToken(null);
    setIsAdmin(false);
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const result = await callAdminFunction('change_password', { oldPassword, newPassword });
      return result.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  // Cart functions
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

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
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

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Product functions (admin only)
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const result = await callAdminFunction('add_product', { product });
      if (result.product) {
        setProducts((prev) => [mapDbToProduct(result.product), ...prev]);
        toast.success('Product added successfully');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const result = await callAdminFunction('update_product', { id, updates });
      if (result.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? mapDbToProduct(result.product) : p))
        );
        toast.success('Product updated successfully');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await callAdminFunction('delete_product', { id });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Drop functions
  const activeDrop = drops.find((d) => d.isActive) || null;

  const createDrop = async (drop: Omit<Drop, 'id' | 'isActive'> & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) => {
    try {
      const result = await callAdminFunction('create_drop', { drop });
      if (result.drop) {
        const newDrop = mapDbToDrop(result.drop);
        newDrop.productIds = [];
        setDrops((prev) => [newDrop, ...prev]);
        toast.success('Drop created successfully');
        return newDrop;
      }
    } catch (error) {
      console.error('Error creating drop:', error);
      toast.error('Failed to create drop');
    }
    return null;
  };

  const updateDrop = async (id: string, updates: Partial<Drop> & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' }) => {
    try {
      const result = await callAdminFunction('update_drop', { id, updates });
      if (result.drop) {
        setDrops((prev) =>
          prev.map((d) => (d.id === id ? { ...mapDbToDrop(result.drop), productIds: d.productIds } : d))
        );
        toast.success('Drop updated successfully');
      }
    } catch (error) {
      console.error('Error updating drop:', error);
      toast.error('Failed to update drop');
    }
  };

  const cancelDrop = async (id: string) => {
    try {
      await callAdminFunction('cancel_drop', { id });
      setDrops((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isActive: false } : d))
      );
      toast.success('Drop cancelled');
    } catch (error) {
      console.error('Error cancelling drop:', error);
      toast.error('Failed to cancel drop');
    }
  };

  const completeDrop = async () => {
    if (activeDrop) {
      try {
        await callAdminFunction('complete_drop', { id: activeDrop.id });
        // Mark products as new
        setProducts((prev) =>
          prev.map((p) =>
            p.dropId === activeDrop.id ? { ...p, isNew: true } : p
          )
        );
        setDrops((prev) =>
          prev.map((d) => (d.id === activeDrop.id ? { ...d, isActive: false } : d))
        );
      } catch (error) {
        console.error('Error completing drop:', error);
      }
    }
  };

  // Order functions - now uses server-side validation
  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    try {
      const result = await callAdminFunction('submit_order', {
        customerName: order.customerName,
        phone: order.phone,
        wilaya: order.wilaya,
        deliveryType: order.deliveryType,
        items: order.items,
        total: order.total
      }, false);
      
      if (result.success) {
        clearCart();
        toast.success('Order placed successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to place order');
        return false;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      return false;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const result = await callAdminFunction('update_order_status', { id, status });
      if (result.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
        toast.success('Order status updated');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Refresh functions for external use
  const refreshProducts = fetchProducts;
  const refreshDrops = fetchDrops;
  const refreshOrders = fetchOrders;

  // Visibility logic
  const getVisibleProducts = useCallback(() => {
    if (!activeDrop || !activeDrop.isActive) {
      return products.filter(p => !p.dropId || !drops.find(d => d.id === p.dropId && d.isActive));
    }

    const now = new Date();
    const releaseDate = new Date(activeDrop.releaseDate);

    // If countdown has passed, show all products
    if (now >= releaseDate) {
      return products;
    }

    // During active drop, hide products assigned to this drop
    return products.filter((p) => p.dropId !== activeDrop.id);
  }, [products, activeDrop, drops]);

  // Get products for a specific drop
  const getDropProducts = useCallback((dropId: string) => {
    return products.filter(p => p.dropId === dropId);
  }, [products]);

  // Upload media file - now uses signed URLs for admin uploads
  const uploadMedia = async (file: File, folder: string = 'products'): Promise<string | null> => {
    if (!isAdmin) {
      toast.error('Unauthorized');
      return null;
    }
    
    try {
      // Get signed upload URL from admin function
      const result = await callAdminFunction('upload_media', {
        fileName: file.name,
        contentType: file.type,
      });
      
      if (result.signedUrl) {
        // Upload using signed URL
        const uploadResponse = await fetch(result.signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }
        
        // Get public URL
        const { data } = supabase.storage.from('media').getPublicUrl(result.path);
        return data.publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  return {
    products,
    cart,
    orders,
    isAdmin,
    isCartOpen,
    brandLogo,
    activeDrop,
    drops,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setIsCartOpen,
    loginAdmin,
    logoutAdmin,
    changePassword,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrderStatus,
    getCartTotal,
    setBrandLogo,
    getVisibleProducts,
    getDropProducts,
    createDrop,
    updateDrop,
    cancelDrop,
    refreshProducts,
    refreshDrops,
    refreshOrders,
    completeDrop,
    uploadMedia,
  };
}
