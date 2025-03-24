// src/app/astrologers/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  AstrologerWithDetails, 
  Astrologer, 
  AstrologerReview, 
  AstrologerAvailability,
  AstrologerHoroscopePrice 
} from '@/types/astrologers';
import { 
  CalendarIcon, 
  Clock, 
  Star, 
  StarHalf, 
  Languages, 
  Award, 
  ChevronLeft,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Pobieranie danych astrologa z Supabase
async function getAstrologer(id: string): Promise<AstrologerWithDetails | null> {
  const supabase = await createClient();
  
  // Pobierz podstawowe dane astrologa
  const { data: astrologer, error: astrologerError } = await supabase
    .from('astrologers')
    .select('*')
    .eq('id', id)
    .single();
    
  if (astrologerError || !astrologer) {
    console.error('Error fetching astrologer:', astrologerError);
    return null;
  }
  
  // Pobierz dostępność astrologa
  const { data: availability, error: availabilityError } = await supabase
    .from('astrologer_availability')
    .select('*')
    .eq('astrologer_id', id)
    .order('day_of_week', { ascending: true });
    
  if (availabilityError) {
    console.error('Error fetching availability:', availabilityError);
  }
  
  // Pobierz ceny horoskopów
  const { data: horoscopePrices, error: pricesError } = await supabase
    .from('astrologer_horoscope_prices')
    .select('*')
    .eq('astrologer_id', id)
    .order('credits_price', { ascending: true });
    
  if (pricesError) {
    console.error('Error fetching horoscope prices:', pricesError);
  }
  
  // Pobierz recenzje (bez połączenia z profiles, które powoduje błąd)
  const { data: reviews, error: reviewsError } = await supabase
    .from('astrologer_reviews')
    .select('*')
    .eq('astrologer_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
  }
  
  // Złóż wszystkie dane w jeden obiekt
  return {
    ...astrologer as Astrologer,
    availability: availability as AstrologerAvailability[] || [],
    horoscope_prices: horoscopePrices as AstrologerHoroscopePrice[] || [],
    reviews: reviews as AstrologerReview[] || []
  };
}

// Funkcja pomocnicza do formatowania dnia tygodnia
function formatDayOfWeek(day: number): string {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  return days[day];
}

// Funkcja pomocnicza do formatowania czasu
function formatTime(time: string): string {
  return time.substring(0, 5); // Format HH:MM
}

// Komponent do wyświetlania ocen w gwiazdkach
function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 text-yellow-300 fill-yellow-300" />
      ))}
      {hasHalfStar && <StarHalf className="h-5 w-5 text-yellow-300 fill-yellow-300" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-400" />
      ))}
    </div>
  );
}

// Główny komponent strony
export default async function AstrologerDetailPage({ params }: { params: { id: string } }) {
  // Jawne "resolved" params przed użyciem - to rozwiązuje błąd Next.js
  const id = params?.id || '';
  const astrologer = await getAstrologer(id);
  
  if (!astrologer) {
    notFound();
  }
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-8 px-4 bg-indigo-900/30">
        <div className="max-w-6xl mx-auto">
          <Link href="/astrologers" className="inline-flex items-center text-indigo-300 hover:text-indigo-200 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Powrót do listy astrologów
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Zdjęcie astrologa */}
            <div className="md:w-1/3">
              <div className="relative w-full aspect-square max-w-xs mx-auto bg-indigo-800/30 rounded-lg overflow-hidden border border-indigo-500/20 shadow-lg">
                {astrologer.profile_image_url ? (
                  <img 
                    src={astrologer.profile_image_url} 
                    alt={astrologer.display_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-5xl font-semibold text-indigo-300">
                    {astrologer.first_name[0]}{astrologer.last_name[0]}
                  </div>
                )}
                
                {astrologer.is_featured && (
                  <div className="absolute top-4 right-4 bg-yellow-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Wyróżniony
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-900/80 backdrop-blur-sm p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <RatingStars rating={astrologer.rating_average} />
                      <span className="ml-2 text-white">{astrologer.rating_average.toFixed(1)}</span>
                    </div>
                    <span className="text-indigo-200 text-sm">
                      {astrologer.ratings_count} {astrologer.ratings_count === 1 ? 'ocena' : 
                       (astrologer.ratings_count % 10 >= 2 && astrologer.ratings_count % 10 <= 4 && 
                        (astrologer.ratings_count % 100 < 10 || astrologer.ratings_count % 100 >= 20)) ? 
                        'oceny' : 'ocen'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Dostępność */}
              <Card className="mt-6 bg-indigo-900/40 border-indigo-300/30 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-300" />
                    Dostępność
                  </CardTitle>
                  <CardDescription className="text-indigo-200">
                    Godziny pracy astrologa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {astrologer.availability && astrologer.availability.length > 0 ? (
                    <ul className="space-y-2">
                      {astrologer.availability.map((slot) => (
                        <li key={slot.id} className="flex justify-between items-center p-2 bg-indigo-800/30 rounded">
                          <span className="font-medium">{formatDayOfWeek(slot.day_of_week)}</span>
                          <span className="text-indigo-200">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-indigo-300 text-center p-2 bg-indigo-800/30 rounded">
                      Brak informacji o dostępności
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <div className={`w-full px-4 py-2 text-center rounded ${astrologer.is_available ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
                    {astrologer.is_available ? (
                      <>
                        <BadgeCheck className="inline-block h-4 w-4 mr-1" />
                        Obecnie dostępny
                      </>
                    ) : (
                      <>Obecnie niedostępny</>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Informacje o astrologu */}
            <div className="md:w-2/3">
              <div className="bg-indigo-900/40 border border-indigo-300/30 rounded-lg p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-white mystical-glow mb-2">
                  {astrologer.display_name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mt-4 mb-6">
                  {astrologer.years_of_experience && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-indigo-300 mr-2" />
                      <span className="text-indigo-100">
                        {astrologer.years_of_experience} lat doświadczenia
                      </span>
                    </div>
                  )}
                  
                  {astrologer.languages && astrologer.languages.length > 0 && (
                    <div className="flex items-center">
                      <Languages className="h-5 w-5 text-indigo-300 mr-2" />
                      <span className="text-indigo-100">
                        {astrologer.languages.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-indigo-200 mb-3">O mnie</h3>
                {astrologer.full_bio ? (
                  <div className="text-indigo-100 mb-6 leading-relaxed whitespace-pre-line">
                    {astrologer.full_bio}
                  </div>
                ) : (
                  <p className="text-indigo-300 mb-6">
                    {astrologer.short_bio || "Brak informacji o astrologu."}
                  </p>
                )}
                
                {/* Ceny horoskopów */}
                <h3 className="text-xl font-semibold text-indigo-200 mt-8 mb-4">Ceny horoskopów</h3>
                {astrologer.horoscope_prices && astrologer.horoscope_prices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {astrologer.horoscope_prices.map((price) => (
                      <div 
                        key={price.id} 
                        className="bg-indigo-800/30 border border-indigo-700/50 rounded-lg p-4 hover:bg-indigo-800/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium capitalize">
                            Horoskop {price.horoscope_type === 'daily' ? 'dzienny' :
                                     price.horoscope_type === 'weekly' ? 'tygodniowy' :
                                     price.horoscope_type === 'monthly' ? 'miesięczny' :
                                     price.horoscope_type === 'yearly' ? 'roczny' : 'życiowy'}
                          </h4>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-yellow-300 mr-1">
                              {price.credits_price}
                            </span>
                            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                          </div>
                        </div>
                        <p className="text-indigo-200 text-sm">
                          {price.description || `Szczegółowy horoskop ${price.horoscope_type === 'daily' ? 'na dzień' :
                                                price.horoscope_type === 'weekly' ? 'na tydzień' :
                                                price.horoscope_type === 'monthly' ? 'na miesiąc' :
                                                price.horoscope_type === 'yearly' ? 'na rok' : 'na całe życie'}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-indigo-300 text-center p-4 bg-indigo-800/30 rounded">
                    Brak informacji o cenach horoskopów
                  </p>
                )}
                
                {/* Przycisk zamawiania */}
                <div className="mt-8">
                  <Link 
                    href="/dashboard" 
                    className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg text-center shadow-lg transition-colors"
                  >
                    Zamów horoskop
                  </Link>
                  <p className="text-indigo-300 text-sm text-center mt-2">
                    Zaloguj się, aby zamówić indywidualny horoskop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recenzje */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Opinie klientów 
            <span className="text-indigo-300 ml-2 text-lg font-normal">
              ({astrologer.ratings_count})
            </span>
          </h2>
          
          {astrologer.reviews && astrologer.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {astrologer.reviews.map((review) => (
                <Card key={review.id} className="bg-indigo-900/30 border-indigo-300/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">
                          Użytkownik {review.user_id.substring(0, 4)}
                        </CardTitle>
                        <CardDescription className="text-indigo-300">
                          {new Date(review.created_at).toLocaleDateString('pl-PL')}
                        </CardDescription>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-indigo-100">{review.comment}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
              <Star className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
              <h3 className="text-xl text-white mb-2">Brak opinii</h3>
              <p className="text-indigo-200 max-w-md mx-auto">
                Ten astrolog nie ma jeszcze opinii. Zamów horoskop i zostań pierwszą osobą, która oceni jego usługi.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA section */}
      <section className="py-12 px-4 mt-6 bg-indigo-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mystical-glow mb-6">
            Odkryj, co gwiazdy mają dla Ciebie w zanadrzu
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-3xl mx-auto">
            {astrologer.display_name} jest gotów, aby pomóc Ci odnaleźć odpowiedzi na pytania, 
            które nurtują Twoją duszę. Zaplanuj konsultację już dziś.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            Zaloguj się i zamów horoskop
          </Link>
        </div>
      </section>
    </div>
  );
}