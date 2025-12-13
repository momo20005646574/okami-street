import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { loginAdmin, isAdmin, logoutAdmin } = useStore();
  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setPassword('');
      setError(false);
      onClose();
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
      <div className="animate-fade-in border border-border bg-background p-8 w-full max-w-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs uppercase tracking-widest">
            {isAdmin ? 'admin panel' : 'admin access'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">you are logged in as admin</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/admin');
                }}
                className="brutalist-btn flex-1"
              >
                go to panel
              </button>
              <button onClick={handleLogout} className="brutalist-btn-outline flex-1">
                logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="enter password"
                className={`form-input ${error ? 'border-destructive' : ''}`}
                autoFocus
              />
              {error && (
                <p className="text-destructive text-xs mt-2">incorrect password</p>
              )}
            </div>
            <button type="submit" className="brutalist-btn w-full">
              unlock
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
