import { Link } from 'react-router-dom';
import { Product } from '@/types/store';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className={`product-card group animate-slide-up opacity-0 stagger-${(index % 8) + 1}`}
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="relative aspect-square bg-white overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain p-4 transition-transform duration-300 ease-out group-hover:-translate-y-1"
        />

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-white">sold out</span>
          </div>
        )}

        {discountPercent > 0 && product.stock > 0 && (
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-xs uppercase tracking-widest font-medium">
            -{discountPercent}%
          </div>
        )}
      </div>

      <div className="p-3 bg-white">
        <h3 className="text-black text-xs lowercase tracking-wider underline-hover">
          <span>"{product.title}"</span>
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-black font-medium">
            {product.price.toLocaleString()} da
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {product.originalPrice.toLocaleString()} da
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
