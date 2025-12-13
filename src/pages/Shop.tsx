import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { CartPanel } from '@/components/CartPanel';

const Shop = () => {
  const { products } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartPanel />

      <main className="pt-24 pb-16">
        <div className="container px-4">
          <div className="mb-8">
            <h1 className="text-xs uppercase tracking-widest mb-2">shop</h1>
            <p className="text-xs text-muted-foreground">
              {products.length} items
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 okami streetwear · algiers, algeria
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
