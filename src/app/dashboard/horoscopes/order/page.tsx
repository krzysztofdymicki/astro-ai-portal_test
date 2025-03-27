'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  History,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Astrologer {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  rating_average: number;
  years_of_experience: number | null;
}

interface HoroscopePrice {
  id: string;
  astrologer_id: string;
  horoscope_type: string;
  credits_price: number;
  description: string | null;
}

export default function OrderHoroscopePage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile, credits, refreshUserData } = useUser();
  
  const [loading, setLoading] = useState({
    astrologers: true,
    submitting: false
  });
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [prices, setPrices] = useState<HoroscopePrice[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('daily');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceDescription, setPriceDescription] = useState<string>('');
  
  // Ładowanie astrologów
  useEffect(() => {
    const fetchAstrologers = async () => {
      setLoading(prev => ({ ...prev, astrologers: true }));
      
      try {
        const { data, error } = await supabase
          .from('astrologers')
          .select('id, display_name, profile_image_url, rating_average, years_of_experience')
          .eq('is_available', true)
          .order('rating_average', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setAstrologers(data);
          if (data.length > 0) {
            setSelectedAstrologer(data[0].id);
          }
        }
        
        // Pobierz ceny horoskopów
        const { data: priceData, error: priceError } = await supabase
          .from('astrologer_horoscope_prices')
          .select('*');
          
        if (priceError) throw priceError;
        
        if (priceData) {
          setPrices(priceData);
        }
      } catch (error) {
        console.error('Error fetching astrologers:', error);
        toast.error('Nie udało się pobrać listy astrologów');
      } finally {
        setLoading(prev => ({ ...prev, astrologers: false }));
      }
    };
    
    fetchAstrologers();
  }, [supabase]);
  
  // Aktualizacja ceny po zmianie astrologa lub typu horoskopu
  useEffect(() => {
    if (selectedAstrologer && selectedType && prices.length > 0) {
      const price = prices.find(
        p => p.astrologer_id === selectedAstrologer && p.horoscope_type === selectedType
      );
      
      if (price) {
        setCurrentPrice(price.credits_price);
        setPriceDescription(price.description || getDefaultDescription(selectedType));
      } else {
        setCurrentPrice(null);
        setPriceDescription('');
      }
    }
  }, [selectedAstrologer, selectedType, prices]);
  
  // Formatowanie typu horoskopu
  const formatHoroscopeType = (type: string): string => {
    switch (type) {
      case 'daily': return 'Dzienny';
      case 'weekly': return 'Tygodniowy';
      case 'monthly': return 'Miesięczny';
      case 'yearly': return 'Roczny';
      case 'lifetime': return 'Życiowy';
      default: return type;
    }
  };
  
  // Domyślny opis dla typu horoskopu
  const getDefaultDescription = (type: string): string => {
    switch (type) {
      case 'daily': return 'Szczegółowy horoskop na dzień z personalizowanymi wskazówkami.';
      case 'weekly': return 'Tygodniowa prognoza z analizą dni pomyślnych i wyzwań.';
      case 'monthly': return 'Miesięczna analiza astrologiczna ze szczegółowym opisem poszczególnych tygodni.';
      case 'yearly': return 'Kompleksowy horoskop roczny z analizą wszystkich sfer życia.';
      case 'lifetime': return 'Pogłębiona analiza całościowa z mapą życiową i karmicznymi wyzwaniami.';
      default: return '';
    }
  };
  
  // Ikona dla typu horoskopu
  const getHoroscopeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="h-5 w-5" />;
      case 'weekly': return <Calendar className="h-5 w-5" />;
      case 'monthly': return <CalendarRange className="h-5 w-5" />;
      case 'yearly': return <History className="h-5 w-5" />;
      case 'lifetime': return <Star className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };
  
  // Szacowany czas przygotowania horoskopu
  const getEstimatedTime = (type: string): string => {
    switch (type) {
      case 'daily': return '~30 minut';
      case 'weekly': return '~2 godziny';
      case 'monthly': return '~6 godzin';
      case 'yearly': return '~24 godziny';
      case 'lifetime': return '~72 godziny';
      default: return 'czas nieokreślony';
    }
  };
  
  // Złożenie zamówienia
  const handlePlaceOrder = async () => {
    if (!selectedAstrologer || !selectedType || !currentPrice) {
      toast.error('Wybierz astrologa i typ horoskopu');
      return;
    }
    
    if (!profile?.id) {
      toast.error('Nie jesteś zalogowany');
      return;
    }
    
    if ((credits?.balance || 0) < currentPrice) {
      toast.error('Nie masz wystarczającej liczby kredytów');
      return;
    }
    
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      // Dodaj zamówienie horoskopu
      const { data, error } = await supabase
        .from('horoscope_orders')
        .insert({
          user_id: profile.id,
          astrologer_id: selectedAstrologer,
          horoscope_type: selectedType,
          status: 'pending',
          credits_amount: currentPrice,
          user_notes: null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Odśwież dane użytkownika (kredyty)
        await refreshUserData();
        
        toast.success('Zamówienie zostało złożone', {
          description: 'Astrolog rozpocznie przygotowanie Twojego horoskopu niedługo.'
        });
        
        // Przekieruj do widoku oczekujących horoskopów
        router.push('/dashboard/horoscopes/pending');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Nie udało się złożyć zamówienia');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/dashboard/horoscopes" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Zamów horoskop</h1>
      </div>
      
      <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-glow">
        <CardHeader>
          <CardTitle>Wybierz astrologa i typ horoskopu</CardTitle>
          <CardDescription className="text-indigo-200">
            Nasi doświadczeni astrologowie przygotują Twój osobisty horoskop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading.astrologers ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wybór astrologa */}
              <div className="space-y-2">
                <label className="text-indigo-100 font-medium">Astrolog</label>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {astrologers.map((astrologer) => (
                    <div 
                      key={astrologer.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedAstrologer === astrologer.id 
                          ? 'bg-indigo-700/40 border-2 border-indigo-500/50' 
                          : 'bg-indigo-800/30 border border-indigo-700/30 hover:bg-indigo-700/30'
                      }`}
                      onClick={() => setSelectedAstrologer(astrologer.id)}
                    >
                      <div className="flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden mr-3">
                        {astrologer.profile_image_url ? (
                          <img 
                            src={astrologer.profile_image_url} 
                            alt={astrologer.display_name} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-600/30 flex items-center justify-center text-lg font-medium">
                            {astrologer.display_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-white truncate">{astrologer.display_name}</div>
                        <div className="flex items-center text-xs text-indigo-300">
                          <Star className="h-3 w-3 mr-1 text-yellow-300 fill-yellow-300" />
                          <span>{astrologer.rating_average.toFixed(1)}</span>
                          {astrologer.years_of_experience && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{astrologer.years_of_experience} lat</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Wybór typu horoskopu */}
              <div className="space-y-2">
                <label className="text-indigo-100 font-medium">Typ horoskopu</label>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {['daily', 'weekly', 'monthly', 'yearly', 'lifetime'].map((type) => {
                    const price = prices.find(
                      p => p.astrologer_id === selectedAstrologer && p.horoscope_type === type
                    );
                    
                    if (!price) return null;
                    
                    return (
                      <div 
                        key={type}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedType === type 
                            ? 'bg-indigo-700/40 border-2 border-indigo-500/50' 
                            : 'bg-indigo-800/30 border border-indigo-700/30 hover:bg-indigo-700/30'
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {getHoroscopeTypeIcon(type)}
                            <h4 className="ml-2 font-medium">{formatHoroscopeType(type)}</h4>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold text-yellow-300 mr-1">{price.credits_price}</span>
                            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                          </div>
                        </div>
                        <p className="text-xs text-indigo-300 mt-1">
                          Czas przygotowania: {getEstimatedTime(type)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Opis wybranego horoskopu */}
              {priceDescription && (
                <div className="bg-indigo-800/20 border border-indigo-500/20 rounded-lg p-4 text-indigo-100">
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    {getHoroscopeTypeIcon(selectedType)}
                    <span className="ml-2">Horoskop {formatHoroscopeType(selectedType).toLowerCase()}</span>
                  </h4>
                  <p>{priceDescription}</p>
                  <div className="mt-4 flex items-center text-indigo-300 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Szacowany czas przygotowania: {getEstimatedTime(selectedType)}</span>
                  </div>
                </div>
              )}
              
              {/* Podsumowanie zamówienia */}
              <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-3">Podsumowanie</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Twoje kredyty:</span>
                    <span className="font-medium flex items-center">
                      {credits?.balance || 0}
                      <Star className="h-3 w-3 ml-1 text-yellow-300 fill-yellow-300" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Koszt horoskopu:</span>
                    <span className="font-medium flex items-center">
                      {currentPrice || 0}
                      <Star className="h-3 w-3 ml-1 text-yellow-300 fill-yellow-300" />
                    </span>
                  </div>
                  <div className="border-t border-indigo-700/50 my-2 pt-2 flex justify-between">
                    <span className="text-indigo-100">Po zamówieniu:</span>
                    <span className="font-bold flex items-center">
                      {Math.max(0, (credits?.balance || 0) - (currentPrice || 0))}
                      <Star className="h-3 w-3 ml-1 text-yellow-300 fill-yellow-300" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow"
            onClick={handlePlaceOrder}
            disabled={loading.astrologers || loading.submitting || !currentPrice || (credits?.balance || 0) < (currentPrice || 0)}
          >
            {loading.submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              'Zamów horoskop'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}