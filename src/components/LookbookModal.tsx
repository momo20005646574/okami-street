import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface LookbookModalProps {
  images: string[];
  onClose: () => void;
}

export function LookbookModal({ images, onClose }: LookbookModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-muted-foreground transition-colors"
        >
          <X size={24} />
        </button>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          no lookbook images available
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-foreground hover:text-muted-foreground transition-colors z-10"
      >
        <X size={24} />
      </button>

      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 border border-border bg-background/50 hover:bg-secondary transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="w-full h-full flex items-center justify-center p-16">
        <img
          src={images[currentIndex]}
          alt={`Lookbook ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 border border-border bg-background/50 hover:bg-secondary transition-colors"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 border border-border transition-colors ${
              idx === currentIndex ? 'bg-foreground' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <p className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        {currentIndex + 1} / {images.length}
      </p>
    </div>
  );
}
