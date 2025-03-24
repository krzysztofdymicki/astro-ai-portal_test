import { createClient } from '@/utils/supabase/server';
import { Astrologer } from '@/types/astrologers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Languages, Clock, Award } from 'lucide-react';

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
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mystical-glow mb-6">
            Nasi Doświadczeni Astrologowie
          </h1>
          <p className="text-indigo-200 text-lg max-w-3xl mx-auto">
            Poznaj naszych wykwalifikowanych astrologów, którzy pomogą Ci odkryć ścieżkę zapisaną w gwiazdach 
            i rozwikłać tajemnice Twojego przeznaczenia.
          </p>
        </div>
      </section>
      
      {/* Main content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {astrologers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {astrologers.map((astrologer) => (
                <Link 
                  href={`/astrologers/${astrologer.id}`} 
                  key={astrologer.id}
                  className="block transform transition-transform hover:scale-105"
                >
                  <Card className="bg-indigo-900/40 border-indigo-300/30 text-white h-full shadow-lg hover:shadow-indigo-500/20 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {astrologer.display_name}
                            {astrologer.is_featured && (
                              <Badge className="ml-2 bg-yellow-600/70 text-yellow-100 border-yellow-500/50">
                                Wyróżniony
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-indigo-200">
                            {astrologer.years_of_experience ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {astrologer.years_of_experience} lat doświadczenia
                              </span>
                            ) : (
                              "Astrolog"
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center text-yellow-300">
                          <Star className="fill-yellow-300 h-5 w-5" />
                          <span className="ml-1">{astrologer.rating_average.toFixed(1)}</span>
                          <span className="text-xs text-indigo-300 ml-1">({astrologer.ratings_count})</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      {astrologer.profile_image_url ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-indigo-400/30">
                          <img 
                            src={astrologer.profile_image_url} 
                            alt={astrologer.display_name} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-indigo-700/30 border-2 border-indigo-400/30 flex items-center justify-center text-3xl">
                          {astrologer.first_name[0]}{astrologer.last_name[0]}
                        </div>
                      )}
                      
                      <p className="text-indigo-100 mb-4 text-center">
                        {astrologer.short_bio || "Specjalista od przepowiedni astralnych i horoskopów."}
                      </p>
                      
                      {astrologer.languages && astrologer.languages.length > 0 && (
                        <div className="flex items-center justify-center mt-2 text-indigo-200 text-sm">
                          <Languages className="h-4 w-4 mr-2" />
                          <span>
                            {astrologer.languages.join(', ')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t border-indigo-700/50 pt-4">
                      <div className={`w-full px-4 py-2 text-center rounded-md ${astrologer.is_available ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
                        {astrologer.is_available ? 'Dostępny' : 'Obecnie niedostępny'}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
              <Award className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
              <h3 className="text-xl text-white mb-2">Brak astrologów</h3>
              <p className="text-indigo-200">
                Aktualnie nie ma dostępnych astrologów. Prosimy sprawdzić ponownie później.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-12 px-4 mt-12 bg-indigo-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mystical-glow mb-6">
            Odkryj Swoją Przyszłość Już Dziś
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-3xl mx-auto">
            Nasi astrologowie są gotowi, aby pomóc Ci odnaleźć odpowiedzi na pytania, które nurtują 
            Twoją duszę. Zaplanuj konsultację i dowiedz się, co gwiazdy mają dla Ciebie w zanadrzu.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            Zaloguj się i zamów horoskop
          </Link>
        </div>
      </section>
    </div>
  );
}