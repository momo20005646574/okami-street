import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in max-w-sm px-4">
        <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-6">
          <Check size={32} />
        </div>
        
        <h1 className="text-xs uppercase tracking-widest mb-4">
          order placed
        </h1>
        
        <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
          thank you for your order. we will contact you soon to confirm delivery details.
        </p>

        <Link to="/" className="brutalist-btn inline-block">
          continue shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
