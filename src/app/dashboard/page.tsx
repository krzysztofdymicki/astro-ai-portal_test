'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Błąd wylogowania", {
          description: error.message
        });
      } else {
        toast.success("Wylogowano pomyślnie");
        router.push('/');
      }
    } catch (error) {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nawigacja */}
      <header className="bg-indigo-900/70 backdrop-blur-sm shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl text-white text-light">Twoja Przepowiednia</span>
            </div>
            <Button 
              onClick={handleSignOut}
              disabled={loading}
              variant="outline" 
              className="text-white border-indigo-300/50 hover:bg-indigo-800/50"
            >
              {loading ? "Wylogowywanie..." : "Wyloguj się"}
            </Button>
          </div>
        </div>
      </header>

      {/* Treść główna */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="container-transparent max-w-3xl w-full text-center p-10 backdrop-blur-sm">
          <div className="relative mb-8">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="text-6xl">🔮</div>
            </div>
            <h1 className="text-3xl sm:text-4xl text-white text-light mystical-glow mt-10">Panel użytkownika</h1>
            <div className="mt-2 text-indigo-200 text-light">Twoje osobiste centrum astrologiczne</div>
          </div>
          
          <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-8 mb-8 border border-indigo-800/50">
            <div className="text-5xl mb-4">👷‍♀️</div>
            <h2 className="text-2xl text-white text-light mb-4">Strona w budowie</h2>
            <p className="text-indigo-100 text-light max-w-xl mx-auto">
              Nasi astrologowie i programiści pracują nad tą częścią portalu. 
              Wkrótce będziesz mieć dostęp do spersonalizowanych horoskopów i wróżb.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-primary"
                onClick={() => toast.info("Ta funkcja będzie dostępna wkrótce!")}
              >
                Sprawdź swój horoskop
              </Button>
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="bg-indigo-900/40 text-white border-indigo-300/50 hover:bg-indigo-800/60 w-full sm:w-auto"
                >
                  Powrót na stronę główną
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-indigo-200/60 text-sm text-light">
            Dziękujemy za cierpliwość. Gwiazdy potrzebują czasu, aby objawić swoje tajemnice.
          </div>
        </div>
      </main>
      
      {/* Stopka */}
      <footer className="relative z-10 mt-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,5,25,0.3)] to-[rgba(10,5,25,0.6)] backdrop-blur-[2px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-200/70 text-light">
            &copy; {new Date().getFullYear()} Twoja Przepowiednia. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}