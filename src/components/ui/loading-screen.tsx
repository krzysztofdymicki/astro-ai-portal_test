'use client';

import React, { useEffect, useState } from 'react';

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
          // Jeśli minęło mniej niż minDuration, czekamy
          const remainingTime = minDuration - elapsed;
          const timer = setTimeout(() => {
            setIsVisible(false);
          }, remainingTime);
          
          return () => clearTimeout(timer);
        } else {
          // Jeśli minął minimalny czas, od razu ukrywamy
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
    <div className="fixed inset-0 bg-indigo-950/90 z-50 flex flex-col items-center justify-center">
      <div className="w-32 h-32 relative">
        {/* Zewnętrzny okrąg */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-300/30 border-dashed animate-spin-slow"></div>
        
        {/* Środkowy okrąg */}
        <div className="absolute inset-4 rounded-full border-2 border-purple-400/40 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
        
        {/* Wewnętrzny okrąg */}
        <div className="absolute inset-8 rounded-full border-2 border-blue-300/50 animate-spin-slow" style={{ animationDuration: '2s' }}></div>
        
        {/* Środkowa gwiazda */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl animate-pulse">✨</div>
        </div>
        
        {/* Gwiazdki wokół */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-xl animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-xl animate-pulse" style={{ animationDelay: '0.6s' }}>⭐</div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 text-xl animate-pulse" style={{ animationDelay: '0.9s' }}>⭐</div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 text-xl animate-pulse" style={{ animationDelay: '1.2s' }}>⭐</div>
      </div>
      
      <div className="mt-8 text-white text-xl text-center font-light mystical-glow">
        <p className="animate-pulse">Odczytuję mapę gwiazd...</p>
      </div>
    </div>
  );
}