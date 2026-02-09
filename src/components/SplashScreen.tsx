import { useState, useEffect } from 'react';
import appIcon from '/app-icon.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'zooming' | 'settling' | 'fadeOut'>('initial');

  useEffect(() => {
    // Start zoom animation
    const startTimer = setTimeout(() => setAnimationPhase('zooming'), 50);
    
    // Settle back to normal scale
    const settleTimer = setTimeout(() => setAnimationPhase('settling'), 500);
    
    // Start fade out
    const fadeTimer = setTimeout(() => setAnimationPhase('fadeOut'), 1100);
    
    // Complete and remove splash
    const completeTimer = setTimeout(() => onComplete(), 1350);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(settleTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-250 ${
        animationPhase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Content container - centered */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* App Icon with zoom animation */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            animationPhase === 'initial' 
              ? 'opacity-0 scale-100' 
              : animationPhase === 'zooming'
              ? 'opacity-100 scale-[1.06]'
              : 'opacity-100 scale-100'
          }`}
        >
          <img 
            src={appIcon} 
            alt="Shivam CCTV" 
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-2xl"
            style={{ borderRadius: '16px' }}
          />
        </div>

        {/* Brand Text with glow effect */}
        <div 
          className={`flex flex-col items-center gap-1 transition-all duration-500 ease-in-out ${
            animationPhase === 'initial' 
              ? 'opacity-0' 
              : 'opacity-100'
          }`}
        >
          <h1 
            className={`text-3xl sm:text-4xl font-display font-bold tracking-tight splash-text-glow ${
              animationPhase === 'zooming' ? 'splash-glow-pulse' : ''
            }`}
            style={{
              color: 'hsl(var(--primary))',
              textShadow: animationPhase !== 'initial' 
                ? '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2), 0 0 8px rgba(255, 255, 255, 0.3)'
                : 'none',
            }}
          >
            Shivam CCTV
          </h1>
        </div>
      </div>

      {/* Glow pulse animation styles */}
      <style>{`
        @keyframes glowPulse {
          0% {
            text-shadow: 0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2), 0 0 8px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 20px hsl(var(--primary) / 0.8), 0 0 40px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.4), 0 0 15px rgba(255, 255, 255, 0.5);
          }
          100% {
            text-shadow: 0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2), 0 0 8px rgba(255, 255, 255, 0.3);
          }
        }
        
        .splash-glow-pulse {
          animation: glowPulse 0.6s ease-in-out 1;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
