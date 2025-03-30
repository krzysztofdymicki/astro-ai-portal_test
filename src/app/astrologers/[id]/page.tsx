import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  AstrologerWithDetails, 
  Astrologer, 
  AstrologerAvailability,
  AstrologerHoroscopePrice 
} from '@/types/astrologers';
import { 
  Clock, 
  Languages, 
  Award, 
  ChevronLeft,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDayOfWeek, formatTimeString } from '@/lib/utils';

// Pobieranie danych astrologa z Supabase
async function getAstrologer(id: string): Promise<AstrologerWithDetails | null> {
  const supabase = await createClient();
  
  // Pobierz wszystkie dane astrologa jednym zapytaniem z joinami
  const { data, error } = await supabase
    .from('astrologers')
    .select(`
      *,
      availability: astrologer_availability(*),
      horoscope_prices: astrologer_horoscope_prices(*)
    `)
    .eq('id', id)
    .single();
    
  if (error || !data) {
    console.error('Error fetching astrologer data:', error);
    return null;
  }
  
  // Zwróć złożony obiekt
  return {
    ...data as Astrologer,
    availability: data.availability as AstrologerAvailability[] || [],
    horoscope_prices: data.horoscope_prices as AstrologerHoroscopePrice[] || []
  };
}

// Główny komponent strony
export default async function AstrologerDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params before using its properties
  const { id } = await params;
  const astrologer = await getAstrologer(id);
  
  if (!astrologer) {
    notFound();
  }
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/astrologers" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Powrót do listy astrologów
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Zdjęcie astrologa i dostępność */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                {/* Zdjęcie astrologa */}
                <div className="relative w-full aspect-square max-w-xs mx-auto overflow-hidden rounded-lg border border-gray-200 mb-4">
                  {astrologer.profile_image_url ? (
                    <img 
                      src={astrologer.profile_image_url} 
                      alt={astrologer.display_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-5xl font-semibold text-gray-500 bg-gray-100">
                      {astrologer.first_name[0]}{astrologer.last_name[0]}
                    </div>
                  )}
                  
                  {astrologer.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        Wyróżniony
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Dostępność */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-lg font-semibold text-gray-800">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                    Dostępność
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Godziny pracy astrologa
                  </p>
                  
                  {astrologer.availability && astrologer.availability.length > 0 ? (
                    <ul className="space-y-2">
                      {astrologer.availability.map((slot) => (
                        <li key={slot.id} className="flex justify-between items-center p-2.5 bg-indigo-50 rounded border border-indigo-100">
                          <span className="font-medium text-gray-700">{formatDayOfWeek(slot.day_of_week)}</span>
                          <span className="text-gray-600">
                            {formatTimeString(slot.start_time)} - {formatTimeString(slot.end_time)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-center p-3 bg-indigo-50 rounded border border-indigo-100">
                      Brak informacji o dostępności
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Informacje o astrologu */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {astrologer.display_name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mt-4 mb-6">
                  {astrologer.years_of_experience && (
                    <Badge variant="outline" className="flex items-center text-base font-normal px-3 py-1.5 border-indigo-200 text-indigo-700 bg-indigo-50">
                      <Clock className="h-4 w-4 text-indigo-600 mr-2" />
                      {astrologer.years_of_experience} lat doświadczenia
                    </Badge>
                  )}
                  
                  {astrologer.languages && astrologer.languages.length > 0 && (
                    <Badge variant="outline" className="flex items-center text-base font-normal px-3 py-1.5 border-indigo-200 text-indigo-700 bg-indigo-50">
                      <Languages className="h-4 w-4 text-indigo-600 mr-2" />
                      {astrologer.languages.join(', ')}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">O mnie</h3>
                  {astrologer.full_bio ? (
                    <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
                      {astrologer.full_bio}
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-6">
                      {astrologer.short_bio || "Brak informacji o astrologu."}
                    </p>
                  )}
                </div>
                
                {/* Ceny horoskopów */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Ceny horoskopów</h3>
                  {astrologer.horoscope_prices && astrologer.horoscope_prices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {astrologer.horoscope_prices.map((price) => (
                        <div 
                          key={price.id} 
                          className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 hover:bg-indigo-100/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium text-gray-800 capitalize">
                              Horoskop {price.horoscope_type === 'daily' ? 'dzienny' :
                                      price.horoscope_type === 'weekly' ? 'tygodniowy' :
                                      price.horoscope_type === 'monthly' ? 'miesięczny' :
                                      price.horoscope_type === 'yearly' ? 'roczny' : 'życiowy'}
                            </h4>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 ml-2">
                              {price.credits_price} kredytów
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {price.description || `Szczegółowy horoskop ${price.horoscope_type === 'daily' ? 'na dzień' :
                                                  price.horoscope_type === 'weekly' ? 'na tydzień' :
                                                  price.horoscope_type === 'monthly' ? 'na miesiąc' :
                                                  price.horoscope_type === 'yearly' ? 'na rok' : 'na całe życie'}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center p-4 bg-indigo-50 border border-indigo-100 rounded">
                      Brak informacji o cenach horoskopów
                    </p>
                  )}
                </div>
                
                {/* Przycisk zamawiania */}
                <div className="mt-8">
                  <Link 
                    href="/dashboard" 
                    className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg text-center font-medium shadow-sm transition-colors"
                  >
                    Zamów horoskop
                  </Link>
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Zaloguj się, aby zamówić indywidualny horoskop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <section className="py-12 px-4 mt-6 bg-indigo-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Odkryj, co gwiazdy mają dla Ciebie w zanadrzu
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-3xl mx-auto">
            {astrologer.display_name} jest gotów, aby pomóc Ci odnaleźć odpowiedzi na pytania, 
            które nurtują Twoją duszę. Zaplanuj konsultację już dziś.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-8 rounded-lg font-medium shadow-lg transition-colors"
          >
            Zaloguj się i zamów horoskop
          </Link>
        </div>
      </section>
    </div>
  );
}