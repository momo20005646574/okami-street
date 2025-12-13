import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import emptyCartImage from '@/assets/empty-cart.png';

export function CartPanel() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
  } = useStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 z-40"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="cart-panel animate-slide-in-right">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xs uppercase tracking-widest">your cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <img
                  src="https://media.tenor.com/OVxXGG6zqYgAAAAi/anime-sad.gif"
                  alt="empty cart"
                  className="w-80 h-80 object-contain mb-8 opacity-90 grayscale"
                />
                <p className="text-base text-muted-foreground mb-2">
                  your cart is lonely
                </p>
                <p className="text-sm text-muted-foreground">add some drip</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 border-b border-border pb-6"
                  >
                    <div className="w-20 h-20 bg-card flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="product-title text-xs truncate">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        size: {item.size}
                      </p>
                      <p className="text-xs mt-1">
                        {item.product.price.toLocaleString()} da
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="border border-border p-1 hover:bg-secondary"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="border border-border p-1 hover:bg-secondary"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.size)
                          }
                          className="ml-auto text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-border">
              <div className="flex justify-between mb-4">
                <span className="text-xs uppercase tracking-widest">total</span>
                <span className="text-sm font-medium">
                  {getCartTotal().toLocaleString()} da
                </span>
              </div>
              <button onClick={handleCheckout} className="brutalist-btn w-full">
                checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
