import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { AdminLoginModal } from './AdminLoginModal';
import okamiLogo from '@/assets/okami-logo.png';

export function Header() {
  const { cart, setIsCartOpen, isAdmin } = useStore();
  const [showLogin, setShowLogin] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-3 border border-border p-2">
            <img src={okamiLogo} alt="okami" className="h-8 w-8 invert" />
            <span className="text-xs uppercase tracking-widest hidden sm:block">
              okami
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="brutalist-btn-outline relative flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowLogin(true)}
              className={`brutalist-btn-outline flex items-center gap-2 ${
                isAdmin ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <Lock size={16} />
            </button>
          </div>
        </div>
      </header>

      <AdminLoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
