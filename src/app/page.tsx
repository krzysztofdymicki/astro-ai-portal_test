// src/app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CosmicBackground from '@/components/background/CosmicBackground'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Kosmiczne tło */}
      <CosmicBackground />
      
      <header className="bg-transparent z-10 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-3xl text-light text-white mb-4 sm:mb-0">
              Twoja Przepowiednia
            </h1>
            <div className="flex gap-3 sm:gap-4">
              <Button asChild className="flex-1 sm:flex-none btn-secondary">
                <Link href="/login">Zaloguj się</Link>
              </Button>
              <Button asChild className="flex-1 sm:flex-none btn-primary">
                <Link href="/register">Zarejestruj się</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow z-10 pt-6 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-light mystical-glow text-white">
              <span className="block mb-2">Odkryj swoją przyszłość</span>
              <span className="block text-indigo-300">z pomocą doświadczonych astrologów</span>
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-md text-base text-light text-indigo-100/90 sm:text-lg md:max-w-3xl md:text-xl leading-relaxed">
              Personalizowane horoskopy, wróżby i porady tworzone specjalnie dla Ciebie
              przez ekspertów w dziedzinie astrologii i ezoteryki.
            </p>
            <div className="mx-auto mt-6 sm:mt-8 max-w-xs">
              <Button asChild className="w-full btn-primary py-6 text-base">
                <Link href="/register">Rozpocznij za darmo</Link>
              </Button>
            </div>
          </div>
          
          {/* Sekcja pokazująca zalety */}
          <div className="mt-20 sm:mt-24">
            <h2 className="text-xl sm:text-2xl text-light text-center mb-10 sm:mb-16 text-white">
              Dlaczego nasi klienci nam ufają?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 container-transparent">
                <div className="text-2xl sm:text-3xl text-light text-indigo-300 mb-3">15+</div>
                <h3 className="text-base sm:text-lg mb-2 text-white text-light">Lat doświadczenia</h3>
                <p className="text-indigo-100/80 text-sm sm:text-base text-light">
                  Nasi astrologowie posiadają wieloletnie doświadczenie w interpretacji gwiazd.
                </p>
              </div>
              <div className="text-center p-6 container-transparent">
                <div className="text-2xl sm:text-3xl text-light text-indigo-300 mb-3">10 000+</div>
                <h3 className="text-base sm:text-lg mb-2 text-white text-light">Zadowolonych klientów</h3>
                <p className="text-indigo-100/80 text-sm sm:text-base text-light">
                  Tysiące osób zaufało naszym prognozom i poradom życiowym.
                </p>
              </div>
              <div className="text-center p-6 container-transparent">
                <div className="text-2xl sm:text-3xl text-light text-indigo-300 mb-3">ponad 90%</div>
                <h3 className="text-base sm:text-lg mb-2 text-white text-light">Trafność</h3>
                <p className="text-indigo-100/80 text-sm sm:text-base text-light">
                  Nasze prognozy charakteryzują się niezwykłą precyzją i trafnością.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sekcja świadectw */}
          <div className="mt-16 sm:mt-24 mb-16">
            <h2 className="text-xl sm:text-2xl text-light text-center mb-10 sm:mb-16 text-white">
              Co mówią nasi klienci
            </h2>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="p-6 container-transparent">
                <p className="italic text-indigo-100/80 mb-4 text-light text-sm sm:text-base leading-relaxed">
                  &quot;Nigdy nie wierzyłam w astrologię, dopóki nie wypróbowałam tej strony. 
                  Horoskopy są tak trafne, że aż mnie ciarki przechodzą!&quot;
                </p>
                <p className="text-light text-white text-sm sm:text-base">
                  - Anna K., Warszawa
                </p>
              </div>
              <div className="p-6 container-transparent">
                <p className="italic text-indigo-100/80 mb-4 text-light text-sm sm:text-base leading-relaxed">
                  &quot;Korzystam z tych horoskopów codziennie. Pomagają mi podejmować 
                  lepsze decyzje i rozumieć siebie.&quot;
                </p>
                <p className="text-light text-white text-sm sm:text-base">
                  - Marek W., Kraków
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="h-16 bg-gradient-to-b from-transparent to-[rgba(10,5,25,0.3)] backdrop-blur-[1px] mt-8"></div>

{/* Stopka z płynnym przejściem */}
<footer className="relative z-10">
  {/* Gradient przejścia w stopce */}
  <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,5,25,0.3)] to-[rgba(10,5,25,0.6)] backdrop-blur-[2px]"></div>
  
  <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <p className="text-center text-sm text-indigo-200/80 text-light">
      &copy; {new Date().getFullYear()} Twoja Przepowiednia. Wszystkie prawa zastrzeżone.
    </p>
  </div>
</footer>
</div>
  )
}