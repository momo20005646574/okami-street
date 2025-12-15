import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'delete product',
  message = 'Are you sure you want to delete this product?',
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
      <div className="animate-fade-in border border-border bg-background p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={16} className="text-destructive" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="brutalist-btn flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            delete
          </button>
          <button onClick={onClose} className="brutalist-btn-outline flex-1">
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}