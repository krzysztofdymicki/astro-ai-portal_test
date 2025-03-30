'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Clock, Star } from 'lucide-react';
import { Horoscope, HoroscopeOrder } from '@/types/horoscopes';
import { HoroscopeCard } from '@/components/ui/horoscopes/HoroscopeCard';
import { HoroscopeOrderCard } from '@/components/ui/horoscopes/HoroscopeOrderCard';

export default function HoroscopesPage() {
  const supabase = createClient();
  const { profile } = useUser();
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [pendingOrders, setPendingOrders] = useState<HoroscopeOrder[]>([]);
  
  // Pobieranie horoskopów użytkownika
  useEffect(() => {
    const fetchHoroscopes = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      try {
        // Pobierz gotowe horoskopy
        const { data: horoscopesData, error: horoscopesError } = await supabase
          .from('horoscopes')
          .select(`
            *,
            astrologer:astrologers(display_name, profile_image_url)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (horoscopesError) throw horoscopesError;
        
        if (horoscopesData) {
          setHoroscopes(horoscopesData);
        }
        
        // Pobierz oczekujące zamówienia
        const { data: ordersData, error: ordersError } = await supabase
          .from('horoscope_orders')
          .select(`
            *,
            astrologer:astrologers(display_name, profile_image_url)
          `)
          .eq('user_id', profile.id)
          .not('status', 'eq', 'completed')
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        if (ordersData) {
          setPendingOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching horoscopes:', error);
        toast.error('Nie udało się pobrać horoskopów');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoroscopes();
  }, [profile, supabase]);
  
  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="card-mystical p-4 pb-4 rounded-t-lg border border-indigo-700/30">
          <TabsList className="bg-transparent w-full border-0 shadow-none">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-700/50 data-[state=active]:shadow-mystical">
              Wszystkie
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-indigo-700/50 data-[state=active]:shadow-mystical">
              Oczekujące
              {pendingOrders.length > 0 && (
                <Badge className="ml-2 bg-yellow-600/70 text-yellow-100 border-yellow-500/50">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-indigo-700/50 data-[state=active]:shadow-mystical">
              Dzienne
            </TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-indigo-700/50 data-[state=active]:shadow-mystical">
              Pozostałe
            </TabsTrigger>
          </TabsList>
        
          <div className="pt-5 pb-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div>
                {/* Wszystkie horoskopy */}
                <TabsContent value="all" className="space-y-8 mt-0 h-full">
                  {horoscopes.length === 0 && pendingOrders.length === 0 ? (
                    <div className="text-center pt-12 pb-6 card-mystical p-6 flex flex-col items-center justify-between h-[420px]">
                      <div>
                        <Sparkles className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
                        <h3 className="text-2xl text-foreground mb-3">Brak horoskopów</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Nie masz jeszcze żadnych horoskopów. Zamów swój pierwszy horoskop, aby odkryć, co gwiazdy mają dla Ciebie w zanadrzu.
                        </p>
                      </div>
                      <div className="mt-8">
                        <Button asChild className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all">
                          <Link href="/dashboard/horoscopes/order">
                            <Star className="h-5 w-5 mr-2" />
                            Zamów horoskop
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Sekcja oczekujących zamówień */}
                      {pendingOrders.length > 0 && (
                        <section>
                          <h2 className="text-2xl font-semibold text-white mystical-glow mb-6">Oczekujące zamówienia</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pendingOrders.map((order) => (
                              <HoroscopeOrderCard key={order.id} order={order} />
                            ))}
                          </div>
                        </section>
                      )}
                      
                      {/* Sekcja gotowych horoskopów */}
                      {horoscopes.length > 0 && (
                        <section>
                          <h2 className="text-2xl font-semibold text-white mystical-glow mb-6">Twoje horoskopy</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {horoscopes.map((horoscope) => (
                              <HoroscopeCard key={horoscope.id} horoscope={horoscope} />
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                {/* Oczekujące zamówienia */}
                <TabsContent value="pending" className="mt-0 h-full">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center pt-12 pb-6 card-mystical p-6 flex flex-col items-center justify-between h-[420px]">
                      <div>
                        <Clock className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
                        <h3 className="text-2xl text-foreground mb-3">Brak oczekujących zamówień</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Nie masz obecnie żadnych oczekujących zamówień. Zamów nowy horoskop, aby dowiedzieć się, co gwiazdy mają dla Ciebie w zanadrzu.
                        </p>
                      </div>
                      <div className="mt-8">
                        <Button asChild className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all">
                          <Link href="/dashboard/horoscopes/order">
                            <Star className="h-5 w-5 mr-2" />
                            Zamów horoskop
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {pendingOrders.map((order) => (
                        <HoroscopeOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Dzienne horoskopy */}
                <TabsContent value="daily" className="mt-0 h-full">
                  {horoscopes.filter(h => h.horoscope_type === 'daily').length === 0 ? (
                    <div className="text-center pt-12 pb-6 card-mystical p-6 flex flex-col items-center justify-between h-[420px]">
                      <div>
                        <Clock className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
                        <h3 className="text-2xl text-foreground mb-3">Brak dziennych horoskopów</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Nie masz jeszcze żadnych dziennych horoskopów. Zamów swój pierwszy dzienny horoskop, aby poznać wpływ gwiazd na nadchodzący dzień.
                        </p>
                      </div>
                      <div className="mt-8">
                        <Button asChild className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all">
                          <Link href="/dashboard/horoscopes/order">
                            <Star className="h-5 w-5 mr-2" />
                            Zamów horoskop
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {horoscopes
                        .filter(h => h.horoscope_type === 'daily')
                        .map((horoscope) => (
                          <HoroscopeCard key={horoscope.id} horoscope={horoscope} />
                        ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Pozostałe horoskopy */}
                <TabsContent value="other" className="mt-0 h-full">
                  {horoscopes.filter(h => h.horoscope_type !== 'daily').length === 0 ? (
                    <div className="text-center pt-12 pb-6 card-mystical p-6 flex flex-col items-center justify-between h-[420px]">
                      <div>
                        <Sparkles className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
                        <h3 className="text-2xl text-foreground mb-3">Brak innych horoskopów</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Nie masz jeszcze horoskopów tygodniowych, miesięcznych ani rocznych. Zamów horoskop na dłuższy okres, aby poznać swoje długoterminowe perspektywy.
                        </p>
                      </div>
                      <div className="mt-8">
                        <Button asChild className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all">
                          <Link href="/dashboard/horoscopes/order">
                            <Star className="h-5 w-5 mr-2" />
                            Zamów horoskop
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {horoscopes
                        .filter(h => h.horoscope_type !== 'daily')
                        .map((horoscope) => (
                          <HoroscopeCard key={horoscope.id} horoscope={horoscope} />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            )}
          </div>
        </div>
        
        {/* Cytat motywacyjny */}
        <div className="mt-8 text-center py-6">
          <p className="text-indigo-200 italic text-light">
            &ldquo;Gwiazdy podpowiadają, ale to Ty podejmujesz decyzje. Twój los jest w Twoich rękach.&rdquo;
          </p>
          <p className="text-indigo-300 text-sm mt-1">― Starożytna mądrość astrologiczna</p>
        </div>
      </Tabs>
    </div>
  );
}