import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { WILAYAS } from '@/types/store';
import { Header } from '@/components/Header';
import { CartPanel } from '@/components/CartPanel';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, addOrder } = useStore();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    wilaya: '',
    deliveryType: 'home' as 'home' | 'desk',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CartPanel />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-sm mb-4">your cart is empty</p>
            <Link to="/" className="brutalist-btn-outline">
              go to shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'phone is required';
    } else if (!/^(0[567]\d{8})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'invalid algerian phone number';
    }
    if (!formData.wilaya) {
      newErrors.wilaya = 'wilaya is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addOrder({
      customerName: formData.customerName,
      phone: formData.phone,
      wilaya: formData.wilaya,
      deliveryType: formData.deliveryType,
      items: cart,
      total: getCartTotal(),
    });

    navigate('/order-success');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartPanel />

      <main className="pt-24 pb-16">
        <div className="container px-4 max-w-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            back
          </button>

          <h1 className="text-xs uppercase tracking-widest mb-8">checkout</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <div className="border border-border p-4">
              <h2 className="text-xs uppercase tracking-widest mb-4">
                order summary
              </h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex justify-between text-xs"
                  >
                    <span>
                      "{item.product.title}" ({item.size}) x{item.quantity}
                    </span>
                    <span>
                      {(item.product.price * item.quantity).toLocaleString()} da
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-xs uppercase tracking-widest">
                    total
                  </span>
                  <span className="font-medium">
                    {getCartTotal().toLocaleString()} da
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest block mb-2">
                  full name
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className={`form-input ${
                    errors.customerName ? 'border-destructive' : ''
                  }`}
                  placeholder="your full name"
                />
                {errors.customerName && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest block mb-2">
                  phone number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`form-input ${
                    errors.phone ? 'border-destructive' : ''
                  }`}
                  placeholder="05XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest block mb-2">
                  wilaya
                </label>
                <select
                  value={formData.wilaya}
                  onChange={(e) =>
                    setFormData({ ...formData, wilaya: e.target.value })
                  }
                  className={`form-select ${
                    errors.wilaya ? 'border-destructive' : ''
                  }`}
                >
                  <option value="">select wilaya</option>
                  {WILAYAS.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
                {errors.wilaya && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.wilaya}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest block mb-2">
                  delivery type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, deliveryType: 'home' })
                    }
                    className={`size-btn flex-1 ${
                      formData.deliveryType === 'home' ? 'active' : ''
                    }`}
                  >
                    home delivery
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, deliveryType: 'desk' })
                    }
                    className={`size-btn flex-1 ${
                      formData.deliveryType === 'desk' ? 'active' : ''
                    }`}
                  >
                    desk pickup
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">
                payment method: cash on delivery only
              </p>
            </div>

            <button type="submit" className="brutalist-btn w-full">
              place order
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
