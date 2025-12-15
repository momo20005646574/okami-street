import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { CartPanel } from '@/components/CartPanel';
import { DropCountdown } from '@/components/DropCountdown';
import { LookbookModal } from '@/components/LookbookModal';
import { ProductCard } from '@/components/ProductCard';
import { Drop } from '@/types/store';
import okamiLogo from '@/assets/okami-logo.png';

interface DropPageProps {
  drop: Drop & { backgroundUrl?: string; backgroundType?: 'image' | 'gif' | 'video' };
  onDropComplete: () => void;
}

const DropPage = ({ drop, onDropComplete }: DropPageProps) => {
  const { products, brandLogo, getVisibleProducts } = useStore();
  const [showLookbook, setShowLookbook] = useState(false);
  const [showPreviousProducts, setShowPreviousProducts] = useState(false);

  const logoSrc = brandLogo || okamiLogo;

  // Get previous drop products (products not assigned to current drop)
  const previousProducts = getVisibleProducts().filter(
    (p) => p.dropId !== drop.id
  );

  const backgroundUrl = drop.backgroundUrl || drop.backgroundImage;
  const backgroundType = drop.backgroundType || 'image';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Media */}
      {backgroundUrl && (
        <>
          {backgroundType === 'video' ? (
            <video
              src={backgroundUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-background/70" />
        </>
      )}

      <div className="relative z-10">
        <Header />
        <CartPanel />

        <main className="pt-24 pb-16 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-lg mx-auto animate-fade-in">
            {/* Brand Logo */}
            <div className="mb-6">
              <div className="inline-block border border-border p-4 bg-background">
                <img
                  src={logoSrc}
                  alt="okami"
                  className="h-20 w-20 object-contain"
                />
              </div>
            </div>

            {/* Brand Name */}
            <h1 className="text-lg uppercase tracking-[0.3em] mb-8">okami</h1>

            {/* Drop Name */}
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
              {drop.name}
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <DropCountdown
                releaseDate={drop.releaseDate}
                onComplete={onDropComplete}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLookbook(true)}
                className="brutalist-btn-outline"
              >
                lookbook
              </button>
              <button
                onClick={() => setShowPreviousProducts(true)}
                className="brutalist-btn"
              >
                products
              </button>
            </div>
          </div>
        </main>

        {/* Previous Products Section */}
        {showPreviousProducts && (
          <div className="fixed inset-0 z-40 bg-background overflow-y-auto">
            <div className="container px-4 py-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs uppercase tracking-widest">
                  previous drops
                </h2>
                <button
                  onClick={() => setShowPreviousProducts(false)}
                  className="brutalist-btn-outline text-xs"
                >
                  close
                </button>
              </div>

              {previousProducts.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs py-16">
                  no previous products available
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {previousProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lookbook Modal */}
        {showLookbook && (
          <LookbookModal
            images={drop.lookbookImages}
            onClose={() => setShowLookbook(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DropPage;