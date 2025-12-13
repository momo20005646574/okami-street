import { useState, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Trash2, Edit2, Plus, Phone, X, Upload, GripVertical, Settings, Image } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types/store';

type Tab = 'orders' | 'products' | 'settings';

const Admin = () => {
  const {
    isAdmin,
    logoutAdmin,
    orders,
    products,
    updateOrderStatus,
    deleteProduct,
    updateProduct,
    addProduct,
    brandLogo,
    setBrandLogo,
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs uppercase tracking-widest">
            okami admin
          </Link>
          <button
            onClick={logoutAdmin}
            className="brutalist-btn-outline flex items-center gap-2"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">logout</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="container px-4 flex">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingCart size={14} />
            orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package size={14} />
            products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings size={14} />
            settings
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="container px-4 py-8">
        {activeTab === 'orders' && (
          <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} />
        )}
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            deleteProduct={deleteProduct}
            updateProduct={updateProduct}
            addProduct={addProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            showAddProduct={showAddProduct}
            setShowAddProduct={setShowAddProduct}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab brandLogo={brandLogo} setBrandLogo={setBrandLogo} />
        )}
      </main>
    </div>
  );
};

function SettingsTab({
  brandLogo,
  setBrandLogo,
}: {
  brandLogo: string | null;
  setBrandLogo: (logo: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBrandLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xs uppercase tracking-widest mb-6">brand settings</h2>
      
      <div className="border border-border p-6">
        <label className="text-xs uppercase tracking-widest block mb-4">
          brand logo / icon
        </label>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 border border-border bg-secondary flex items-center justify-center">
            {brandLogo ? (
              <img src={brandLogo} alt="brand logo" className="w-12 h-12 object-contain invert" />
            ) : (
              <Image size={24} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">
              upload a new logo to replace the current one
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="brutalist-btn-outline text-xs flex items-center gap-2"
            >
              <Upload size={12} />
              upload logo
            </button>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground">
          recommended: square image, 200x200px or larger
        </p>
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  updateOrderStatus,
}: {
  orders: ReturnType<typeof useStore>['orders'];
  updateOrderStatus: ReturnType<typeof useStore>['updateOrderStatus'];
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xs text-muted-foreground">no orders yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>customer</th>
            <th>phone</th>
            <th>wilaya</th>
            <th>delivery</th>
            <th>items</th>
            <th>total</th>
            <th>status</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="font-medium">{order.customerName}</td>
              <td>
                <a
                  href={`tel:${order.phone}`}
                  className="flex items-center gap-2 text-foreground hover:underline"
                >
                  <Phone size={12} />
                  {order.phone}
                </a>
              </td>
              <td>{order.wilaya}</td>
              <td>{order.deliveryType}</td>
              <td>
                {order.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="text-xs">
                    "{item.product.title}" ({item.size}) x{item.quantity}
                  </div>
                ))}
              </td>
              <td>{order.total.toLocaleString()} da</td>
              <td>
                <span
                  className={`text-xs uppercase ${
                    order.status === 'confirmed'
                      ? 'text-foreground'
                      : order.status === 'cancelled'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td>
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="brutalist-btn text-[10px] py-1 px-2"
                    >
                      confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="brutalist-btn-outline text-[10px] py-1 px-2"
                    >
                      cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab({
  products,
  deleteProduct,
  updateProduct,
  addProduct,
  editingProduct,
  setEditingProduct,
  showAddProduct,
  setShowAddProduct,
}: {
  products: Product[];
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  showAddProduct: boolean;
  setShowAddProduct: (show: boolean) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs uppercase tracking-widest">all products</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="brutalist-btn flex items-center gap-2"
        >
          <Plus size={14} />
          add product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>image</th>
              <th>title</th>
              <th>price</th>
              <th>original price</th>
              <th>stock</th>
              <th>sizes</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="w-12 h-12 bg-card">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </td>
                <td className="product-title">{product.title}</td>
                <td>{product.price.toLocaleString()} da</td>
                <td>
                  {product.originalPrice
                    ? `${product.originalPrice.toLocaleString()} da`
                    : '-'}
                </td>
                <td>{product.stock}</td>
                <td>{product.sizes.join(', ')}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 border border-border hover:bg-secondary"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 border border-border hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onSave={(updates) => {
            updateProduct(editingProduct.id, updates);
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Add Modal */}
      {showAddProduct && (
        <ProductModal
          onSave={(newProduct) => {
            addProduct(newProduct as Omit<Product, 'id'>);
            setShowAddProduct(false);
          }}
          onClose={() => setShowAddProduct(false)}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onSave,
  onClose,
}: {
  product?: Product;
  onSave: (data: Partial<Product> | Omit<Product, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    stock: product?.stock || 0,
    sizes: product?.sizes.join(', ') || 's, m, l, xl',
    description: product?.description || '',
    category: product?.category || 'tops',
    images: product?.images || [],
  });
  
  const [imageError, setImageError] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
          setImageError(false);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...formData.images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setFormData((prev) => ({ ...prev, images: newImages }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      setImageError(true);
      return;
    }
    
    const sizes = formData.sizes.split(',').map((s) => s.trim().toLowerCase());
    
    onSave({
      title: formData.title,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      sizes,
      description: formData.description,
      category: formData.category as Product['category'],
      images: formData.images,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
      <div className="animate-fade-in border border-border bg-background p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest">
            {product ? 'edit product' : 'add product'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              images *
            </label>
            
            {/* Image Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group aspect-square bg-card border border-border cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <img
                      src={img}
                      alt={`product ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <GripVertical size={14} className="text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5">
                        main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`brutalist-btn-outline w-full flex items-center justify-center gap-2 ${
                imageError ? 'border-destructive text-destructive' : ''
              }`}
            >
              <Upload size={14} />
              upload images
            </button>
            {imageError && (
              <p className="text-xs text-destructive mt-1">
                at least one image is required
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              drag to reorder · first image is main
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest block mb-2">
                price (da)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest block mb-2">
                original price
              </label>
              <input
                type="number"
                value={formData.originalPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: Number(e.target.value) || 0,
                  })
                }
                className="form-input"
                placeholder="leave empty if no discount"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              sizes (comma separated)
            </label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) =>
                setFormData({ ...formData, sizes: e.target.value })
              }
              className="form-input"
              placeholder="s, m, l, xl"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              category
            </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as Product['category'] })
              }
              className="form-select"
            >
              <option value="tops">tops</option>
              <option value="bottoms">bottoms</option>
              <option value="outerwear">outerwear</option>
              <option value="accessories">accessories</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-input min-h-[80px] resize-none"
            />
          </div>

          <button type="submit" className="brutalist-btn w-full">
            {product ? 'save changes' : 'add product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
