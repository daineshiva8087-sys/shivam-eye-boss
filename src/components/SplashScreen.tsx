import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'fadeOut'>('initial');

  useEffect(() => {
    // Start fade out
    const fadeTimer = setTimeout(() => setAnimationPhase('fadeOut'), 1100);
    
    // Complete and remove splash
    const completeTimer = setTimeout(() => onComplete(), 1350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-250 ${
        animationPhase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    />
  );
};

export default SplashScreen;
