import { useState, useEffect } from 'react';

interface DropCountdownProps {
  releaseDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function DropCountdown({ releaseDate, onComplete }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(releaseDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate, onComplete]);

  if (isComplete) {
    return null;
  }

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-6xl font-medium tracking-tighter">
          {pad(timeLeft.days)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          days
        </span>
      </div>
      <span className="text-4xl sm:text-6xl font-light text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-6xl font-medium tracking-tighter">
          {pad(timeLeft.hours)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          hours
        </span>
      </div>
      <span className="text-4xl sm:text-6xl font-light text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-6xl font-medium tracking-tighter">
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          minutes
        </span>
      </div>
      <span className="text-4xl sm:text-6xl font-light text-muted-foreground">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl sm:text-6xl font-medium tracking-tighter">
          {pad(timeLeft.seconds)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          seconds
        </span>
      </div>
    </div>
  );
}
