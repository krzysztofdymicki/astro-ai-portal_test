'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatHoroscopeType } from '@/types/horoscopes';
import type { 
  Astrologer, 
  AstrologerHoroscopePrice
} from '@/types/astrologers';
import AstrologerCard from '@/components/ui/astrologers/AstrologerCard';
import HoroscopePriceCard from '@/components/ui/horoscopes/HoroscopePriceCard';

// Main component for the horoscope order page
export default function OrderHoroscopePage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile, credits, refreshUserData, zodiacSign } = useUser();
  
  // States for the order flow
  const [step, setStep] = useState<'astrologer' | 'horoscope' | 'confirm'>('astrologer');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [prices, setPrices] = useState<AstrologerHoroscopePrice[]>([]);
  const [selectedHoroscope, setSelectedHoroscope] = useState<AstrologerHoroscopePrice | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const astrologersContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch astrologers on component mount
  useEffect(() => {
    const fetchAstrologers = async () => {
      setLoading(true);
      try {
        const { data: astrologersData, error: astrologersError } = await supabase
          .from('astrologers')
          .select('*')
          .eq('is_available', true)
          .order('is_featured', { ascending: false })
          .order('rating_average', { ascending: false });
          
        if (astrologersError) throw astrologersError;
        
        if (astrologersData) {
          setAstrologers(astrologersData);
        }
      } catch (error) {
        console.error('Error fetching astrologers:', error);
        toast.error('Nie udało się pobrać listy astrologów');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAstrologers();
  }, [supabase]);
  
  // Function to fetch prices for a selected astrologer
  const fetchPrices = async (astrologerId: string) => {
    try {
      const { data: pricesData, error: pricesError } = await supabase
        .from('astrologer_horoscope_prices')
        .select('*')
        .eq('astrologer_id', astrologerId)
        .order('credits_price', { ascending: true });
        
      if (pricesError) throw pricesError;
      
      if (pricesData) {
        setPrices(pricesData);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Nie udało się pobrać cennika');
    }
  };
  
  // Function to handle astrologer selection
  const handleSelectAstrologer = async (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    await fetchPrices(astrologer.id);
    setStep('horoscope');
  };
  
  // Function to handle horoscope type selection
  const handleSelectHoroscope = (price: AstrologerHoroscopePrice) => {
    setSelectedHoroscope(price);
    setStep('confirm');
  };
  
  // Function to check if zodiac sign is available
  const hasZodiacSign = () => {
    return profile?.zodiac_sign || zodiacSign?.id;
  };
  
  // Function to submit the order
  const handleSubmitOrder = async () => {
    if (!profile || !selectedAstrologer || !selectedHoroscope) {
      toast.error('Brak wymaganych danych do zamówienia');
      return;
    }
    
    if (!hasZodiacSign()) {
      toast.error('Brak znaku zodiaku', {
        description: 'Uzupełnij datę urodzenia w swoim profilu, aby zamówić horoskop.'
      });
      return;
    }
    
    if (!credits || credits.balance < selectedHoroscope.credits_price) {
      toast.error('Niewystarczająca liczba kredytów', {
        description: 'Doładuj kredyty, aby zamówić ten horoskop.'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 1. Create order in the database
      const { data: orderData, error: orderError } = await supabase
        .from('horoscope_orders')
        .insert({
          user_id: profile.id,
          astrologer_id: selectedAstrologer.id,
          horoscope_type: selectedHoroscope.horoscope_type,
          credits_amount: selectedHoroscope.credits_price,
          user_notes: userNotes.trim() || null,
          status: 'pending'
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // 2. Initiate the generation process (but don't wait for it)
      fetch('/api/horoscopes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
        }),
      }).catch(err => {
        // Just log any errors but don't block the user flow
        console.error('Error initiating generation:', err);
      });
      
      // 3. Refresh user data to update credit balance
      await refreshUserData();
      
      toast.success('Zamówienie zostało przyjęte', {
        description: 'Astrolog przygotuje Twój horoskop w najbliższym czasie.'
      });
      
      // 4. Redirect to horoscopes page
      router.push('/dashboard/horoscopes');
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Nie udało się złożyć zamówienia');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to scroll astrologers carousel
  const scrollAstrologers = (direction: 'left' | 'right') => {
    if (astrologersContainerRef.current) {
      const scrollAmount = 240; // Width of one card
      const currentScroll = astrologersContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      astrologersContainerRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };
  
  // Render the component based on the current step
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/horoscopes" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white mystical-glow">Zamów horoskop</h1>
      </div>
      
      {/* Progress steps - updated for better readability */}
      <div className="bg-indigo-950/80 rounded-lg p-4 mb-6 border border-indigo-600/20">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 h-0.5 bg-indigo-600/50 w-full -z-10"></div>
          
          {/* Step 1: Select Astrologer */}
          <div className={`flex flex-col items-center ${step === 'astrologer' ? 'text-white' : 'text-indigo-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step === 'astrologer' 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-950' 
                : step === 'horoscope' || step === 'confirm' 
                ? 'bg-indigo-800 text-indigo-200 border border-indigo-600' 
                : 'bg-indigo-900/70 text-indigo-400'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Wybierz astrologa</span>
          </div>
          
          {/* Step 2: Select Horoscope */}
          <div className={`flex flex-col items-center ${step === 'horoscope' ? 'text-white' : 'text-indigo-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step === 'horoscope' 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-950' 
                : step === 'confirm' 
                ? 'bg-indigo-800 text-indigo-200 border border-indigo-600' 
                : 'bg-indigo-900/70 text-indigo-400'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Wybierz horoskop</span>
          </div>
          
          {/* Step 3: Confirm & Pay */}
          <div className={`flex flex-col items-center ${step === 'confirm' ? 'text-white' : 'text-indigo-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step === 'confirm' 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-950' 
                : 'bg-indigo-900/70 text-indigo-400'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Potwierdź zamówienie</span>
          </div>
        </div>
      </div>
      
      {/* Your credits indicator */}
      <div className="flex justify-end mb-6">
        <div className="bg-indigo-900/80 px-4 py-2 rounded-full flex items-center border border-indigo-700/50">
          <Star className="h-4 w-4 text-yellow-300 mr-2" />
          <span className="text-white font-medium">Twoje kredyty: <span className="font-bold">{credits?.balance || 0}</span></span>
        </div>
      </div>
      
      {/* Main content based on current step */}
      {step === 'astrologer' && (
        <div className="bg-indigo-950/80 rounded-lg p-6 border border-indigo-600/20">
          <h2 className="text-xl font-semibold text-white text-center mb-6">Wybierz astrologa</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            </div>
          ) : astrologers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-indigo-200">Brak dostępnych astrologów.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Left scroll button */}
              <button
                onClick={() => scrollAstrologers('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-indigo-700/90 hover:bg-indigo-600/90 rounded-full p-2 shadow-lg hidden md:flex items-center justify-center"
                aria-label="Przewiń w lewo"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              
              {/* Astrologers carousel container */}
              <div 
                ref={astrologersContainerRef}
                className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory hide-scrollbar"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {astrologers.map(astrologer => (
                  <div 
                    key={astrologer.id} 
                    className="min-w-[240px] max-w-[240px] flex-shrink-0 snap-center"
                  >
                    <AstrologerCard 
                      astrologer={astrologer} 
                      compact={true}
                      onClick={() => handleSelectAstrologer(astrologer)}
                      asButton={true}
                    />
                  </div>
                ))}
              </div>
              
              {/* Right scroll button */}
              <button
                onClick={() => scrollAstrologers('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-indigo-700/90 hover:bg-indigo-600/90 rounded-full p-2 shadow-lg hidden md:flex items-center justify-center"
                aria-label="Przewiń w prawo"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          )}
          
          {/* Optional instruction for mobile users */}
          {astrologers.length > 0 && (
            <p className="text-center text-indigo-200 text-sm mt-4 md:hidden">
              Przesuń, aby zobaczyć więcej astrologów
            </p>
          )}
        </div>
      )}
      
      {step === 'horoscope' && selectedAstrologer && (
        <div className="bg-indigo-950/80 rounded-lg p-6 border border-indigo-600/20">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Wybierz rodzaj horoskopu od {selectedAstrologer.display_name}
          </h2>
          
          <div className="mb-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setStep('astrologer')}
              className="text-indigo-100 border-indigo-500/50 hover:bg-indigo-700/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do wyboru astrologa
            </Button>
          </div>
          
          {prices.length === 0 ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-4" />
              <p className="text-indigo-200">Ładowanie dostępnych horoskopów...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {prices.map(price => (
                <HoroscopePriceCard
                  key={price.id}
                  price={price}
                  onSelect={() => handleSelectHoroscope(price)}
                  userHasEnoughCredits={credits?.balance ? credits.balance >= price.credits_price : false}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {step === 'confirm' && selectedAstrologer && selectedHoroscope && (
        <div className="bg-indigo-950/80 rounded-lg p-6 border border-indigo-600/20">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Potwierdź zamówienie
          </h2>
          
          <div className="mb-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setStep('horoscope')}
              className="text-indigo-100 border-indigo-500/50 hover:bg-indigo-700/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć do wyboru horoskopu
            </Button>
          </div>
          
          <div className="bg-indigo-900/60 rounded-lg p-5 mb-6 border border-indigo-500/30">
            <h3 className="text-lg font-medium text-white mb-4">Podsumowanie zamówienia</h3>
            
            <div className="grid gap-3 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-indigo-600/30">
                <span className="text-indigo-200">Astrolog:</span>
                <span className="text-white font-medium">{selectedAstrologer.display_name}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-indigo-600/30">
                <span className="text-indigo-200">Rodzaj horoskopu:</span>
                <span className="text-white font-medium">{formatHoroscopeType(selectedHoroscope.horoscope_type)}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-indigo-600/30">
                <span className="text-indigo-200">Znak zodiaku:</span>
                <span className="text-white font-medium">{zodiacSign?.name || 'Nie określono'}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-indigo-600/30">
                <span className="text-indigo-200">Koszt:</span>
                <div className="flex items-center">
                  <span className="text-white font-medium mr-2">{selectedHoroscope.credits_price}</span>
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-200">Stan konta po zakupie:</span>
                <div className="flex items-center">
                  <span className="text-white font-medium mr-2">
                    {(credits?.balance || 0) - selectedHoroscope.credits_price}
                  </span>
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-indigo-200 mb-2 font-medium">
                Dodatkowe informacje dla astrologa (opcjonalnie):
              </label>
              <Textarea
                className="w-full p-3 rounded-md bg-indigo-800/50 border border-indigo-500/50 text-white placeholder:text-indigo-300/70"
                rows={3}
                placeholder="Np. konkretne pytania lub obszary życia, które Cię interesują..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />
            </div>
            
            {!hasZodiacSign() && (
              <div className="bg-amber-900/30 border border-amber-600/40 p-3 rounded-md mb-4">
                <p className="text-amber-200 text-sm">
                  <span className="font-medium">Uwaga:</span> Nie masz określonego znaku zodiaku. 
                  <Link href="/dashboard/profile" className="text-amber-100 underline ml-1 hover:text-white">
                    Uzupełnij datę urodzenia w swoim profilu
                  </Link>, aby móc zamówić horoskop.
                </p>
              </div>
            )}

            <div className="bg-indigo-800/40 border border-indigo-600/30 p-3 rounded-md mb-4">
              <p className="text-indigo-200 text-sm">
                <span className="font-medium">Informacja:</span> Opracowanie spersonalizowanego horoskopu przez astrologa może potrwać od kilku minut do kilku godzin. Po zakończeniu pracy, horoskop pojawi się automatycznie na Twojej liście.
              </p>
            </div>
            
            <Button
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              onClick={handleSubmitOrder}
              disabled={submitting || (credits?.balance || 0) < selectedHoroscope.credits_price || !hasZodiacSign()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Zamów horoskop
                </>
              )}
            </Button>
            
            {(credits?.balance || 0) < selectedHoroscope.credits_price && (
              <p className="text-red-300 text-sm mt-2 text-center">
                Niewystarczająca liczba kredytów. 
                <Link href="/dashboard/credits" className="text-indigo-200 hover:text-indigo-100 ml-1 underline">
                  Doładuj kredyty
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}