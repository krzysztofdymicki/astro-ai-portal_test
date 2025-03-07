// app/(auth)/layout.tsx
import type { Metadata } from 'next'
import '../globals.css'
import Link from 'next/link'
import CosmicBackground from '@/components/background/CosmicBackground'

export const metadata: Metadata = {
  title: 'Twoja Przepowiednia - Zaloguj się lub Zarejestruj',
  description: 'Portal z horoskopami i wróżbami personalizowanymi przez doświadczonych astrologów',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Komponent gwieździstego tła */}
      <CosmicBackground />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo lub emoji */}
        <Link href="/" className="flex justify-center mb-6">
          <span className="text-4xl">🔮</span>
        </Link>
        
        <h2 className="text-center text-3xl text-light mystical-glow text-white">
          Twoja Przepowiednia
        </h2>
        <p className="mt-2 text-center text-sm text-indigo-200 text-light">
          Portal astrologiczny
        </p>
        
        {/* Półprzezroczysty kontener dla formularza */}
        <div className="mt-8 card-mystical p-6 sm:p-8">
          {children}
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="text-sm text-indigo-200 hover:text-white transition-colors text-light"
          >
            &larr; Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  )
}