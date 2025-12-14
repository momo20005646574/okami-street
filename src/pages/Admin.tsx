import { useState, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Trash2, Edit2, Plus, Phone, X, Upload, GripVertical, Settings, Image, Calendar, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, Drop } from '@/types/store';

type Tab = 'orders' | 'products' | 'settings' | 'drops';

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
    activeDrop,
    setActiveDrop,
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
      <div className="border-b border-border overflow-x-auto">
        <div className="container px-4 flex">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 sm:px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
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
            className={`px-4 sm:px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package size={14} />
            products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('drops')}
            className={`px-4 sm:px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'drops'
                ? 'border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles size={14} />
            drops
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 sm:px-6 py-4 text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
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
        {activeTab === 'drops' && (
          <DropsTab
            products={products}
            activeDrop={activeDrop}
            setActiveDrop={setActiveDrop}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab brandLogo={brandLogo} setBrandLogo={setBrandLogo} />
        )}
      </main>
    </div>
  );
};

function DropsTab({
  products,
  activeDrop,
  setActiveDrop,
}: {
  products: Product[];
  activeDrop: Drop | null;
  setActiveDrop: (drop: Drop | null) => void;
}) {
  const [showCreateDrop, setShowCreateDrop] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs uppercase tracking-widest">drop releases</h2>
        {!activeDrop && (
          <button
            onClick={() => setShowCreateDrop(true)}
            className="brutalist-btn flex items-center gap-2"
          >
            <Plus size={14} />
            create drop
          </button>
        )}
      </div>

      {activeDrop ? (
        <div className="border border-border p-6 max-w-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm uppercase tracking-widest mb-2">{activeDrop.name}</h3>
              <p className="text-xs text-muted-foreground">
                releases: {new Date(activeDrop.releaseDate).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingDrop(activeDrop)}
                className="brutalist-btn-outline text-xs py-1 px-3"
              >
                edit
              </button>
              <button
                onClick={() => setActiveDrop(null)}
                className="brutalist-btn-outline text-xs py-1 px-3"
              >
                cancel drop
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest mb-2">assigned products ({activeDrop.productIds.length})</p>
              <div className="flex flex-wrap gap-2">
                {activeDrop.productIds.map((id) => {
                  const product = products.find((p) => p.id === id);
                  return product ? (
                    <span key={id} className="text-xs border border-border px-2 py-1">
                      "{product.title}"
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest mb-2">lookbook images ({activeDrop.lookbookImages.length})</p>
              <div className="flex flex-wrap gap-2">
                {activeDrop.lookbookImages.map((img, idx) => (
                  <div key={idx} className="w-16 h-16 bg-card">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {activeDrop.backgroundImage && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2">background image</p>
                <div className="w-32 h-20 bg-card">
                  <img src={activeDrop.backgroundImage} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-border">
          <Calendar size={32} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-4">no active drop</p>
          <button
            onClick={() => setShowCreateDrop(true)}
            className="brutalist-btn-outline text-xs"
          >
            create your first drop
          </button>
        </div>
      )}

      {(showCreateDrop || editingDrop) && (
        <DropModal
          drop={editingDrop || undefined}
          products={products}
          onSave={(drop) => {
            setActiveDrop(drop);
            setShowCreateDrop(false);
            setEditingDrop(null);
          }}
          onClose={() => {
            setShowCreateDrop(false);
            setEditingDrop(null);
          }}
        />
      )}
    </div>
  );
}

function DropModal({
  drop,
  products,
  onSave,
  onClose,
}: {
  drop?: Drop;
  products: Product[];
  onSave: (drop: Drop) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: drop?.name || '',
    releaseDate: drop?.releaseDate
      ? new Date(drop.releaseDate).toISOString().slice(0, 16)
      : '',
    productIds: drop?.productIds || [],
    lookbookImages: drop?.lookbookImages || [],
    backgroundImage: drop?.backgroundImage || '',
  });

  const lookbookInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleLookbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({
            ...prev,
            lookbookImages: [...prev.lookbookImages, reader.result as string],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          backgroundImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLookbookImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lookbookImages: prev.lookbookImages.filter((_, i) => i !== index),
    }));
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.releaseDate) return;

    onSave({
      id: drop?.id || Date.now().toString(),
      name: formData.name,
      releaseDate: new Date(formData.releaseDate),
      productIds: formData.productIds,
      lookbookImages: formData.lookbookImages,
      backgroundImage: formData.backgroundImage || undefined,
      isActive: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
      <div className="animate-fade-in border border-border bg-background p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest">
            {drop ? 'edit drop' : 'create drop'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop Name */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              drop name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g. winter collection 2024"
              required
            />
          </div>

          {/* Release Date */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              release date & time *
            </label>
            <input
              type="datetime-local"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* Products Selection */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              assign products (hidden until release)
            </label>
            <div className="border border-border p-4 max-h-48 overflow-y-auto space-y-2">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-secondary p-2 -m-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.productIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 accent-foreground"
                  />
                  <div className="w-8 h-8 bg-card flex-shrink-0">
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs">"{product.title}"</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lookbook Images */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              lookbook images
            </label>
            <div className="border border-border p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.lookbookImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 bg-card">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeLookbookImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                ref={lookbookInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleLookbookUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => lookbookInputRef.current?.click()}
                className="brutalist-btn-outline text-xs flex items-center gap-2"
              >
                <Upload size={12} />
                upload images
              </button>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              custom background (optional)
            </label>
            <div className="border border-border p-4">
              {formData.backgroundImage ? (
                <div className="relative w-full h-32 mb-4">
                  <img src={formData.backgroundImage} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                    className="absolute top-2 right-2 w-6 h-6 bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-4">
                  default: black background
                </p>
              )}
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backgroundInputRef.current?.click()}
                className="brutalist-btn-outline text-xs flex items-center gap-2"
              >
                <Upload size={12} />
                upload background
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="brutalist-btn flex-1">
              {drop ? 'update drop' : 'create drop'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="brutalist-btn-outline flex-1"
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
              <img src={brandLogo} alt="brand logo" className="w-full h-full object-contain" />
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
                      className="w-full h-full object-cover"
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
            
            {/* Image Preview Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {formData.images.map((img, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative aspect-square border border-border bg-card cursor-move group ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <GripVertical size={12} className="text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-background py-0.5 uppercase">
                      main
                    </span>
                  )}
                </div>
              ))}
            </div>

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
              className={`w-full border border-dashed ${
                imageError ? 'border-destructive' : 'border-border'
              } p-4 text-center hover:bg-secondary transition-colors`}
            >
              <Upload size={16} className="mx-auto mb-2" />
              <span className="text-xs uppercase tracking-widest">
                upload images
              </span>
            </button>
            {imageError && (
              <p className="text-xs text-destructive mt-1">
                at least one image is required
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">
              drag to reorder · first image is the main thumbnail
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2">
              title *
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
                price (da) *
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest block mb-2">
                stock *
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
                category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as 'tops' | 'bottoms' | 'outerwear' | 'accessories' })
                }
                className="form-select"
              >
                <option value="tops">tops</option>
                <option value="bottoms">bottoms</option>
                <option value="outerwear">outerwear</option>
                <option value="accessories">accessories</option>
              </select>
            </div>
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

          <div className="flex gap-4 pt-4">
            <button type="submit" className="brutalist-btn flex-1">
              {product ? 'update' : 'add product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="brutalist-btn-outline flex-1"
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
