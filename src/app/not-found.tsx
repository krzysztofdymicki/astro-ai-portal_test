// src/app/not-found.tsx

"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-indigo-950/80">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-indigo-400 mystical-glow">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Strona zaginęła w przestrzeni astralnej
          </h2>
          <p className="mt-2 text-sm text-indigo-200">
            Wygląda na to, że trafiliśmy w miejsce, którego gwiazdy nie przewidziały...
          </p>
        </div>
        
        {/* Animacja magiczna */}
        <div className="my-8 relative h-40 flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-indigo-500/20 rounded-full animate-pulse"></div>
          <div className="absolute w-16 h-16 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute w-12 h-12 bg-pink-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          
          {/* Gwiazdy */}
          <div className="absolute top-2 left-10 text-2xl animate-ping" style={{ animationDuration: '3s' }}>✨</div>
          <div className="absolute top-6 right-10 text-2xl animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-4 left-16 text-2xl animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌟</div>
          
          {/* Kryształowa kula */}
          <div className="absolute z-10 text-6xl crystal-ball">🔮</div>
        </div>
        
        <div className="mt-6">
          <p className="text-md mb-6 text-indigo-200">
            Kryształowa kula sugeruje, że powinieneś wrócić na bezpieczną ścieżkę...
          </p>
          <Button 
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white border-none"
          >
            <Link href="/">
              Wróć na stronę główną
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Dodatkowe dekoracje w tle */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="star small" style={{ top: '15%', left: '10%' }}></div>
        <div className="star medium" style={{ top: '65%', left: '20%' }}></div>
        <div className="star small" style={{ top: '35%', left: '85%' }}></div>
        <div className="star medium" style={{ top: '75%', left: '75%' }}></div>
        <div className="star small" style={{ top: '20%', left: '45%' }}></div>
        <div className="star medium" style={{ top: '50%', left: '50%' }}></div>
      </div>
    </div>
  );
}