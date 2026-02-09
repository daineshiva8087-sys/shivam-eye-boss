import { useState, useEffect } from 'react';
import appIcon from '/app-icon.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showIcon, setShowIcon] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start icon fade-in immediately
    const iconTimer = setTimeout(() => setShowIcon(true), 100);
    
    // Show tagline after icon appears
    const taglineTimer = setTimeout(() => setShowTagline(true), 500);
    
    // Start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    
    // Complete and remove splash
    const completeTimer = setTimeout(() => onComplete(), 1400);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(taglineTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-200 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />
      
      {/* Content container */}
      <div className="relative flex flex-col items-center gap-6">
        {/* App Icon */}
        <div 
          className={`transition-all duration-500 ease-out ${
            showIcon 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90'
          }`}
        >
          <div className="relative">
            {/* Subtle glow behind icon */}
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150" />
            <img 
              src={appIcon} 
              alt="Shivam CCTV" 
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Tagline */}
        <div 
          className={`flex flex-col items-center gap-1.5 transition-all duration-400 ease-out ${
            showTagline 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
            Jalna's No.1 CCTV Solution
          </h1>
          <p className="text-sm text-muted-foreground">
            Serving since 2016
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
