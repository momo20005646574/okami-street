import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { CartPanel } from '@/components/CartPanel';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();

  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm mb-4">product not found</p>
          <Link to="/" className="brutalist-btn-outline">
            go back
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setQuantity(1);
    setSelectedSize(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartPanel />

      <main className="pt-20 pb-16">
        <div className="container px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            back
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="animate-fade-in">
              <div className="bg-card aspect-square mb-4">
                <img
                  src={product.images[currentImage]}
                  alt={product.title}
                  className="w-full h-full object-contain p-8"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-16 h-16 bg-card border ${
                        currentImage === index
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
              <h1 className="product-title text-2xl mb-4">{product.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg">
                  {product.price.toLocaleString()} da
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()} da
                    </span>
                    <span className="discount-badge">-{discountPercent}%</span>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-6">
                shipping calculated at checkout
              </p>

              {product.description && (
                <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Stock */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest mb-2">stock</p>
                <p
                  className={`text-xs ${
                    product.stock > 0 ? 'text-foreground' : 'text-destructive'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} units available`
                    : 'sold out'}
                </p>
              </div>

              {/* Size */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest mb-3">size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-btn ${
                        selectedSize === size ? 'active' : ''
                      }`}
                      disabled={product.stock === 0}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-3">quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border border-border p-2 hover:bg-secondary"
                    disabled={product.stock === 0}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="border border-border p-2 hover:bg-secondary"
                    disabled={product.stock === 0}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || product.stock === 0}
                className="brutalist-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0
                  ? 'sold out'
                  : selectedSize
                  ? 'add to cart'
                  : 'select size'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
