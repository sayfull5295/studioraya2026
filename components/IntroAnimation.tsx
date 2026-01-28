
import React, { useEffect, useState } from 'react';

const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for the exit animation to finish before calling onComplete
      setTimeout(onComplete, 1200);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-emerald-950 flex flex-col items-center justify-center overflow-hidden ${isExiting ? 'animate-fade-out-overlay' : ''}`}>
      {/* Background Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              top: '-10%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-6 px-4">
        <div className="space-y-2">
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-gold tracking-widest uppercase animate-reveal" style={{ animationDelay: '0.2s' }}>
                STUDIO RAYA 2026
            </h1>
            <div className="flex items-center justify-center gap-4 animate-reveal" style={{ animationDelay: '0.8s' }}>
                <div className="h-px bg-gold/40 animate-line"></div>
                <p className="text-sm md:text-base text-cream/60 font-medium tracking-[0.5em] uppercase">
                    by THREESIXTY STUDIO
                </p>
                <div className="h-px bg-gold/40 animate-line"></div>
            </div>
        </div>
      </div>

      {/* Luxury Border Animation (Optional) */}
      <div className="absolute inset-10 border border-gold/5 rounded-[3rem] pointer-events-none"></div>
    </div>
  );
};

export default IntroAnimation;
