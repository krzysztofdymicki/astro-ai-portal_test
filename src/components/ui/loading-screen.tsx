'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  show: boolean;
  minDuration?: number; // Minimalna czas trwania animacji w ms
}

export default function LoadingScreen({ show, minDuration = 1000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (show && !isVisible) {
      // Początek ładowania
      setIsVisible(true);
      setStartTime(Date.now());
    } else if (!show && isVisible) {
      // Koniec ładowania, ale z zachowaniem minimalnego czasu
      if (startTime) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minDuration) {
          // Jeśli nie minęło wystarczająco dużo czasu, poczekaj
          const timeout = setTimeout(() => {
            setIsVisible(false);
          }, minDuration - elapsed);
          return () => clearTimeout(timeout);
        } else {
          // Wystarczająco dużo czasu minęło, zamknij od razu
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    }
  }, [show, isVisible, startTime, minDuration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-indigo-950 z-50 flex flex-col items-center justify-center">
      <div className="w-32 h-32 relative">
        {/* Zewnętrzny pierścień */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-300/30 border-dashed animate-spin-slow"></div>
        
        {/* Środkowy pierścień */}
        <div className="absolute inset-4 rounded-full border-2 border-purple-400/40 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
        
        {/* Wewnętrzny pierścień */}
        <div className="absolute inset-8 rounded-full border-2 border-blue-300/50 animate-spin-slow" style={{ animationDuration: '2s' }}></div>
        
        {/* Środek */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 bg-indigo-900/80 rounded-full flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
        </div>
        
        {/* Dekoracja - gwiazdy */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-xl animate-pulse" style={{ animationDelay: '0.7s' }}>🌟</div>
        <div className="absolute top-1/2 right-0 transform translate-x-4 -translate-y-1/2 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>💫</div>
        <div className="absolute top-1/2 left-0 transform -translate-x-4 -translate-y-1/2 text-xl animate-pulse" style={{ animationDelay: '0.9s' }}>⭐</div>
      </div>
      
      <div className="mt-8 text-white text-xl text-center font-light mystical-glow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          Ładowanie twojej przepowiedni...
        </motion.div>
      </div>
    </div>
  );
}