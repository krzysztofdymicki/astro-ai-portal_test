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
import { HoroscopeItem } from '@/components/ui/horoscopes/HoroscopeItem';

export default function HoroscopesPage() {
  const supabase = createClient();
  const { profile } = useUser();
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [pendingOrders, setPendingOrders] = useState<HoroscopeOrder[]>([]);
  
  // Pobieranie horoskopów użytkownika
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
  
  // Pobieranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchHoroscopes();
  }, [profile, supabase]);
  
  // Wszystkie elementy (zamówienia + gotowe horoskopy) posortowane chronologicznie
  const allItems = [...pendingOrders, ...horoscopes].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Filtrowanie horoskopów dziennych
  const dailyHoroscopes = horoscopes.filter(h => h.horoscope_type === 'daily');
  
  // Filtrowanie pozostałych horoskopów (nie dziennych)
  const otherHoroscopes = horoscopes.filter(h => h.horoscope_type !== 'daily');
  
  const renderEmptyState = (type: 'all' | 'pending' | 'daily' | 'other') => {
    let icon, title, description, variant;
    
    switch (type) {
      case 'pending':
        icon = <Clock className="h-16 w-16 mx-auto text-indigo-400 mb-6" />;
        title = "Brak oczekujących zamówień";
        description = "Nie masz obecnie żadnych oczekujących zamówień. Zamów nowy horoskop, aby dowiedzieć się, co gwiazdy mają dla Ciebie w zanadrzu.";
        break;
      case 'daily':
        icon = <Clock className="h-16 w-16 mx-auto text-indigo-400 mb-6" />;
        title = "Brak dziennych horoskopów";
        description = "Nie masz jeszcze żadnych dziennych horoskopów. Zamów swój pierwszy dzienny horoskop, aby poznać wpływ gwiazd na nadchodzący dzień.";
        break;
      case 'other':
        icon = <Sparkles className="h-16 w-16 mx-auto text-indigo-400 mb-6" />;
        title = "Brak innych horoskopów";
        description = "Nie masz jeszcze horoskopów tygodniowych, miesięcznych ani rocznych. Zamów horoskop na dłuższy okres, aby poznać swoje długoterminowe perspektywy.";
        break;
      default:
        icon = <Sparkles className="h-16 w-16 mx-auto text-indigo-400 mb-6" />;
        title = "Brak horoskopów";
        description = "Nie masz jeszcze żadnych horoskopów. Zamów swój pierwszy horoskop, aby odkryć, co gwiazdy mają dla Ciebie w zanadrzu.";
    }
    
    return (
      <div className="text-center pt-12 pb-6 card-mystical p-6 flex flex-col items-center justify-between min-h-[420px]">
        <div>
          {icon}
          <h3 className="text-2xl text-foreground mb-3">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
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
    );
  };
  
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
                <TabsContent value="all" className="mt-0">
                  {allItems.length === 0 ? (
                    renderEmptyState('all')
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                      {allItems.map((item) => (
                        <HoroscopeItem 
                          key={item.id} 
                          item={item} 
                          onRefresh={fetchHoroscopes}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Oczekujące zamówienia */}
                <TabsContent value="pending" className="mt-0">
                  {pendingOrders.length === 0 ? (
                    renderEmptyState('pending')
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                      {pendingOrders.map((order) => (
                        <HoroscopeItem 
                          key={order.id} 
                          item={order} 
                          onRefresh={fetchHoroscopes}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Dzienne horoskopy */}
                <TabsContent value="daily" className="mt-0">
                  {dailyHoroscopes.length === 0 ? (
                    renderEmptyState('daily')
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                      {dailyHoroscopes.map((horoscope) => (
                        <HoroscopeItem 
                          key={horoscope.id} 
                          item={horoscope} 
                          onRefresh={fetchHoroscopes}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Pozostałe horoskopy */}
                <TabsContent value="other" className="mt-0">
                  {otherHoroscopes.length === 0 ? (
                    renderEmptyState('other')
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                      {otherHoroscopes.map((horoscope) => (
                        <HoroscopeItem 
                          key={horoscope.id} 
                          item={horoscope} 
                          onRefresh={fetchHoroscopes}
                        />
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