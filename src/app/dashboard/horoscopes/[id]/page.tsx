'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Star, 
  Clock, 
  Calendar,
  CalendarRange,
  HistoryIcon,
  Sparkles,
  Loader2,
  Share2,
  Printer,
  Download
} from 'lucide-react';

// Interfejs danych horoskopu
interface Horoscope {
  id: string;
  order_id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: string;
  title: string;
  content: string;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  astrologer?: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
  };
}

export default function HoroscopeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { profile } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  
  // Pobieranie horoskopu
  useEffect(() => {
    const fetchHoroscope = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('horoscopes')
          .select(`
            *,
            astrologer:astrologers(id, display_name, profile_image_url)
          `)
          .eq('id', params.id)
          .eq('user_id', profile.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // Nie znaleziono horoskopu
            notFound();
          } else {
            throw error;
          }
        }
        
        if (data) {
          setHoroscope(data);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching horoscope:', error);
        toast.error('Nie udało się pobrać horoskopu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoroscope();
  }, [params.id, profile, supabase]);
  
  // Ikona dla typu horoskopu
  const getHoroscopeTypeIcon = (type: string | undefined) => {
    if (!type) return <Star className="h-5 w-5" />;
    
    switch (type) {
      case 'daily': return <Clock className="h-5 w-5" />;
      case 'weekly': return <Calendar className="h-5 w-5" />;
      case 'monthly': return <CalendarRange className="h-5 w-5" />;
      case 'yearly': return <HistoryIcon className="h-5 w-5" />;
      case 'lifetime': return <Sparkles className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Nieokreślona data';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Formatowanie typu horoskopu
  const formatHoroscopeType = (type: string | undefined): string => {
    if (!type) return '';
    
    switch (type) {
      case 'daily': return 'Dzienny';
      case 'weekly': return 'Tygodniowy';
      case 'monthly': return 'Miesięczny';
      case 'yearly': return 'Roczny';
      case 'lifetime': return 'Życiowy';
      default: return type;
    }
  };
  
  // Formatowanie treści horoskopu z akapitami
  const formatContent = (content: string | undefined): React.ReactNode => {
    if (!content) return null;
    
    // Podziel tekst na akapity i dodaj znaczniki <p>
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };
  
  // Symulacja udostępniania horoskopu
  const handleShare = () => {
    toast.success('Link do udostępnienia skopiowany!', {
      description: 'Możesz teraz wysłać go znajomym przez wiadomość'
    });
  };
  
  // Symulacja drukowania horoskopu
  const handlePrint = () => {
    toast.info('Przygotowywanie do druku', {
      description: 'Twój horoskop zostanie otwarty w nowym oknie do wydruku'
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };
  
  // Symulacja pobierania horoskopu jako PDF
  const handleDownload = () => {
    toast.success('Rozpoczęto pobieranie', {
      description: 'Twój horoskop zostanie pobrany jako plik PDF'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
      </div>
    );
  }
  
  if (!horoscope) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/dashboard/horoscopes" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Twój horoskop</h1>
      </div>
      
      <Card className="bg-indigo-900/30 border-indigo-700/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {getHoroscopeTypeIcon(horoscope.horoscope_type)}
                {horoscope.title}
              </CardTitle>
              <CardDescription className="text-indigo-200 mt-1">
                {formatHoroscopeType(horoscope.horoscope_type)}
              </CardDescription>
            </div>
            
            {horoscope.valid_from && (
              <div className="text-right text-indigo-300 text-sm self-end">
                <div>Ważny od: {formatDate(horoscope.valid_from)}</div>
                {horoscope.valid_to && (
                  <div>do: {formatDate(horoscope.valid_to)}</div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {/* Informacje o astrologu */}
            {horoscope.astrologer && (
              <div className="flex items-center border-b border-indigo-700/30 pb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  {horoscope.astrologer.profile_image_url ? (
                    <img 
                      src={horoscope.astrologer.profile_image_url} 
                      alt={horoscope.astrologer.display_name} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-md">
                      {horoscope.astrologer.display_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-indigo-300">Przygotowane przez</div>
                  <Link 
                    href={`/astrologers/${horoscope.astrologer.id}`}
                    className="font-medium text-indigo-100 hover:text-white transition-colors"
                  >
                    {horoscope.astrologer.display_name}
                  </Link>
                </div>
              </div>
            )}
            
            {/* Treść horoskopu */}
            <div className="prose prose-invert prose-indigo max-w-none">
              {formatContent(horoscope.content)}
            </div>
            
            {/* Data utworzenia */}
            <div className="text-indigo-300 text-sm text-right">
              Data utworzenia: {formatDate(horoscope.created_at)}
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="w-full flex flex-wrap gap-3 justify-end">
            <Button 
              variant="outline" 
              className="bg-indigo-800/30 border-indigo-500/30 text-indigo-100 hover:bg-indigo-700/30"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Udostępnij
            </Button>
            <Button 
              variant="outline" 
              className="bg-indigo-800/30 border-indigo-500/30 text-indigo-100 hover:bg-indigo-700/30"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Pobierz PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Podobne horoskopy */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-4">Zobacz również</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-indigo-900/30 border-indigo-700/30 hover:bg-indigo-800/30 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Zamów nowy horoskop</CardTitle>
              <CardDescription className="text-indigo-300">
                Odkryj, co gwiazdy przygotowały dla Ciebie
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Sparkles className="h-16 w-16 mx-auto text-indigo-400" />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                <Link href="/dashboard/horoscopes/order">
                  Zamów horoskop
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-indigo-900/30 border-indigo-700/30 hover:bg-indigo-800/30 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Konsultacja na żywo</CardTitle>
              <CardDescription className="text-indigo-300">
                Rozmowa z astrologiem w czasie rzeczywistym
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Calendar className="h-16 w-16 mx-auto text-indigo-400" />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-indigo-700/50 hover:bg-indigo-700/70 text-white">
                <Link href="/dashboard/horoscopes">
                  Wkrótce dostępne
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-indigo-900/30 border-indigo-700/30 hover:bg-indigo-800/30 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Wszystkie horoskopy</CardTitle>
              <CardDescription className="text-indigo-300">
                Przejrzyj wszystkie swoje prognozy
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Star className="h-16 w-16 mx-auto text-indigo-400" />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                <Link href="/dashboard/horoscopes">
                  Zobacz wszystkie
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}