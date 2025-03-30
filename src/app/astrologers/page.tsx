import { createClient } from '@/utils/supabase/server';
import { Astrologer } from '@/types/astrologers';
import Link from 'next/link';
import { Award, Star, User } from 'lucide-react';
import AstrologerCard from '@/components/ui/astrologers/AstrologerCard';

// Pobieranie danych astrologów z Supabase
async function getAstrologers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('astrologers')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('rating_average', { ascending: false });
    
  if (error) {
    console.error('Error fetching astrologers:', error);
    return [];
  }
  
  return data as Astrologer[];
}

export default async function AstrologersPage() {
  const astrologers = await getAstrologers();
  
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-16 px-4 bg-gradient-to-b from-indigo-950/90 to-indigo-900/70">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mystical-glow mb-8">
            Nasi Doświadczeni Astrologowie
          </h1>
          <p className="text-indigo-200 text-lg max-w-3xl mx-auto leading-relaxed">
            Poznaj naszych wykwalifikowanych astrologów, którzy pomogą Ci odkryć ścieżkę 
            zapisaną w gwiazdach i rozwikłać tajemnice Twojego przeznaczenia.
          </p>
        </div>
      </section>
      
      {/* Main content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {astrologers.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-white mystical-glow">
                  Dostępni Astrologowie
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {astrologers.map((astrologer) => (
                  <AstrologerCard key={astrologer.id} astrologer={astrologer} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 card-mystical p-6">
              <Award className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
              <h3 className="text-2xl text-foreground mb-3">Brak astrologów</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Aktualnie nie ma dostępnych astrologów. Prosimy sprawdzić ponownie później.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 px-4 mt-8 bg-indigo-900/20 border-t border-b border-indigo-200/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center justify-center p-4 bg-indigo-800/30 rounded-full shadow-mystical">
            <Star className="h-8 w-8 text-yellow-300 fill-yellow-300/50" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mystical-glow mb-6">
            Odkryj Swoją Przyszłość Już Dziś
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
            Nasi astrologowie są gotowi, aby pomóc Ci odnaleźć odpowiedzi na pytania, 
            które nurtują Twoją duszę. Zaplanuj konsultację i dowiedz się, co gwiazdy 
            mają dla Ciebie w zanadrzu.
          </p>
          <Link 
            href="/login" 
            className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all inline-flex items-center"
          >
            <User className="h-5 w-5 mr-2" />
            Zaloguj się i zamów horoskop
          </Link>
        </div>
      </section>
    </div>
  );
}