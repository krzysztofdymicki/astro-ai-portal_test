'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Horoscope, formatHoroscopeType } from '@/types/horoscopes';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HoroscopeDetailPage({ params }: PageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params Promise using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchHoroscope = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('horoscopes')
          .select(`
            *,
            astrologer:astrologers(display_name, profile_image_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setHoroscope(data as Horoscope);
        } else {
          setError('Nie znaleziono horoskopu');
        }
      } catch (error) {
        console.error('Error fetching horoscope:', error);
        setError('Wystąpił błąd podczas pobierania danych horoskopu');
        toast.error('Nie udało się pobrać horoskopu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHoroscope();
    }
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !horoscope) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card-mystical p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Nie znaleziono horoskopu</h2>
          <p className="text-indigo-200 mb-6">{error || 'Nie można wyświetlić wybranego horoskopu'}</p>
          <Button asChild>
            <Link href="/dashboard/horoscopes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wróć do listy horoskopów
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const astrologer = horoscope.astrologer as any;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/dashboard/horoscopes" 
          className="text-indigo-300 hover:text-indigo-200 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do listy horoskopów
        </Link>
      </div>

      <Card className="card-mystical overflow-hidden">
        {/* Nagłówek horoskopu */}
        <CardHeader className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-b border-indigo-700/30">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-white mystical-glow">
                {horoscope.title}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                <Badge className="bg-indigo-700/60 hover:bg-indigo-700/80 text-white border-indigo-500/50 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-300" />
                  {horoscope.zodiac_sign}
                </Badge>
                
                <Badge className="bg-indigo-700/60 hover:bg-indigo-700/80 text-white border-indigo-500/50 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatHoroscopeType(horoscope.horoscope_type)}
                </Badge>
                
                <span className="text-indigo-200 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(horoscope.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Treść horoskopu */}
        <CardContent className="p-0">
          {/* Informacje o ważności */}
          {(horoscope.valid_from || horoscope.valid_to) && (
            <div className="bg-indigo-900/40 p-4 border-b border-indigo-700/30 flex items-center">
              <CalendarIcon className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="text-indigo-200">
                {horoscope.valid_from && horoscope.valid_to 
                  ? `Ważny od ${formatDate(horoscope.valid_from)} do ${formatDate(horoscope.valid_to)}`
                  : horoscope.valid_from 
                    ? `Ważny od ${formatDate(horoscope.valid_from)}`
                    : horoscope.valid_to 
                      ? `Ważny do ${formatDate(horoscope.valid_to)}`
                      : 'Horoskop długoterminowy'
                }
              </span>
            </div>
          )}

          {/* Treść główna horoskopu */}
          <div className="p-6 md:p-8">
            {horoscope.content ? (
              <div className="prose prose-invert prose-indigo max-w-none">
                <div dangerouslySetInnerHTML={{ __html: horoscope.content }} />
              </div>
            ) : (
              <p className="text-center text-indigo-300 italic">
                Ten horoskop nie zawiera treści.
              </p>
            )}
          </div>

          {/* Informacje o astrologu */}
          <div className="border-t border-indigo-700/30 p-4 bg-indigo-900/40">
            <div className="flex items-center">
              {astrologer?.profile_image_url ? (
                <div className="h-10 w-10 rounded-full overflow-hidden border border-indigo-400/30 mr-3">
                  <img
                    src={astrologer.profile_image_url}
                    alt={astrologer.display_name || 'Astrolog'}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-700/30 border border-indigo-400/30 flex items-center justify-center text-white mr-3">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">
                  Przygotowane przez: {astrologer?.display_name || 'Astrolog'}
                </p>
                <p className="text-indigo-300 text-sm">
                  Ekspert w dziedzinie astrologii
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Akcje */}
      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline" 
          className="text-indigo-200 border-indigo-500/50 hover:bg-indigo-700/60 hover:text-white"
          onClick={() => router.push('/dashboard/horoscopes')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć do listy
        </Button>
        
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          onClick={() => window.print()}
        >
          Drukuj horoskop
        </Button>
      </div>
    </div>
  );
}