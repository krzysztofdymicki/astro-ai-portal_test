'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  Star, 
  Clock, 
  Calendar,
  CalendarRange,
  HistoryIcon,
  Sparkles,
  CircleAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    display_name: string;
    profile_image_url: string | null;
  };
}

// Interfejs zamówienia horoskopu
interface HoroscopeOrder {
  id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: string;
  status: string;
  credits_amount: number;
  user_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  astrologer?: {
    display_name: string;
    profile_image_url: string | null;
  };
}

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
  
  // Ikona dla typu horoskopu
  const getHoroscopeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="h-5 w-5" />;
      case 'weekly': return <Calendar className="h-5 w-5" />;
      case 'monthly': return <CalendarRange className="h-5 w-5" />;
      case 'yearly': return <HistoryIcon className="h-5 w-5" />;
      case 'lifetime': return <Sparkles className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };
  
  // Formatowanie statusu zamówienia
  const formatOrderStatus = (status: string): string => {
    switch (status) {
      case 'pending': return 'Oczekujące';
      case 'processing': return 'W trakcie przygotowania';
      case 'completed': return 'Zakończone';
      case 'cancelled': return 'Anulowane';
      default: return status;
    }
  };
  
  // Komponent ikony statusu
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-300" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <CircleAlert className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Formatowanie okresu ważności horoskopu
  const formatValidityPeriod = (horoscope: Horoscope): string => {
    if (!horoscope.valid_from) return 'Bez określonej daty ważności';
    
    const from = new Date(horoscope.valid_from);
    
    if (!horoscope.valid_to) {
      return `Od ${formatDate(horoscope.valid_from)}`;
    }
    
    const to = new Date(horoscope.valid_to);
    return `${formatDate(horoscope.valid_from)} - ${formatDate(horoscope.valid_to)}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white mystical-glow">Twoje Horoskopy</h1>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
          <Link href="/dashboard/horoscopes/order">
            <PlusCircle className="h-4 w-4 mr-2" />
            Zamów nowy horoskop
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-indigo-900/40 border border-indigo-700/30">
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-700/50">
            Wszystkie
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-indigo-700/50">
            Oczekujące
            {pendingOrders.length > 0 && (
              <Badge className="ml-2 bg-yellow-600/70 text-yellow-100 border-yellow-500/50">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-indigo-700/50">
            Dzienne
          </TabsTrigger>
          <TabsTrigger value="other" className="data-[state=active]:bg-indigo-700/50">
            Pozostałe
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <>
              {/* Wszystkie horoskopy */}
              <TabsContent value="all" className="space-y-6">
                {horoscopes.length === 0 && pendingOrders.length === 0 ? (
                  <div className="text-center py-12 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
                    <Sparkles className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <h3 className="text-xl text-white mb-2">Brak horoskopów</h3>
                    <p className="text-indigo-200 max-w-md mx-auto mb-6">
                      Nie masz jeszcze żadnych horoskopów. Zamów swój pierwszy horoskop, aby odkryć, co gwiazdy mają dla Ciebie w zanadrzu.
                    </p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      <Link href="/dashboard/horoscopes/order">
                        Zamów pierwszy horoskop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sekcja oczekujących zamówień */}
                    {pendingOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Oczekujące zamówienia</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pendingOrders.map((order) => (
                            <Link href={`/dashboard/horoscopes/pending#${order.id}`} key={order.id}>
                              <Card className="bg-indigo-900/30 border-indigo-700/30 h-full hover:bg-indigo-800/30 transition-colors cursor-pointer">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-center">
                                    <Badge className="bg-yellow-600/70 text-yellow-100 border-yellow-500/50 flex items-center gap-1">
                                      <StatusIcon status={order.status} />
                                      {formatOrderStatus(order.status)}
                                    </Badge>
                                    <div className="flex items-center">
                                      <span className="text-yellow-300 font-medium mr-1">{order.credits_amount}</span>
                                      <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                                    </div>
                                  </div>
                                  <CardTitle className="text-lg mt-2 flex items-center">
                                    {getHoroscopeTypeIcon(order.horoscope_type)}
                                    <span className="ml-2">
                                      Horoskop {formatHoroscopeType(order.horoscope_type).toLowerCase()}
                                    </span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="flex items-center text-sm text-indigo-200">
                                    <span>Zamówiony: {formatDate(order.created_at)}</span>
                                  </div>
                                  {order.astrologer && (
                                    <div className="flex items-center mt-3">
                                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                                        {order.astrologer.profile_image_url ? (
                                          <img 
                                            src={order.astrologer.profile_image_url} 
                                            alt={order.astrologer.display_name} 
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-xs">
                                            {order.astrologer.display_name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-indigo-100">{order.astrologer.display_name}</span>
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter>
                                  <div className="w-full text-center text-sm text-indigo-300">
                                    Kliknij, aby zobaczyć szczegóły
                                  </div>
                                </CardFooter>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Sekcja gotowych horoskopów */}
                    {horoscopes.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Twoje horoskopy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {horoscopes.map((horoscope) => (
                            <Link href={`/dashboard/horoscopes/${horoscope.id}`} key={horoscope.id}>
                              <Card className="bg-indigo-900/30 border-indigo-700/30 h-full hover:bg-indigo-800/30 transition-colors cursor-pointer">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg flex items-center">
                                    {getHoroscopeTypeIcon(horoscope.horoscope_type)}
                                    <span className="ml-2">
                                      {horoscope.title}
                                    </span>
                                  </CardTitle>
                                  <CardDescription className="text-indigo-300">
                                    {formatHoroscopeType(horoscope.horoscope_type)}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="line-clamp-3 text-indigo-100 mb-2 text-sm">
                                    {horoscope.content.substring(0, 120)}...
                                  </div>
                                  <div className="text-xs text-indigo-300 mt-3">
                                    {formatValidityPeriod(horoscope)}
                                  </div>
                                </CardContent>
                                <CardFooter>
                                  {horoscope.astrologer && (
                                    <div className="flex items-center w-full">
                                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                                        {horoscope.astrologer.profile_image_url ? (
                                          <img 
                                            src={horoscope.astrologer.profile_image_url} 
                                            alt={horoscope.astrologer.display_name} 
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-xs">
                                            {horoscope.astrologer.display_name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-indigo-200 text-xs">{horoscope.astrologer.display_name}</span>
                                    </div>
                                  )}
                                </CardFooter>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {/* Oczekujące zamówienia */}
              <TabsContent value="pending">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-12 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
                    <Clock className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <h3 className="text-xl text-white mb-2">Brak oczekujących zamówień</h3>
                    <p className="text-indigo-200 max-w-md mx-auto mb-6">
                      Nie masz obecnie żadnych oczekujących zamówień. Zamów nowy horoskop, aby dowiedzieć się, co gwiazdy mają dla Ciebie w zanadrzu.
                    </p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      <Link href="/dashboard/horoscopes/order">
                        Zamów nowy horoskop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingOrders.map((order) => (
                      <Link href={`/dashboard/horoscopes/pending#${order.id}`} key={order.id}>
                        <Card className="bg-indigo-900/30 border-indigo-700/30 h-full hover:bg-indigo-800/30 transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <Badge className="bg-yellow-600/70 text-yellow-100 border-yellow-500/50 flex items-center gap-1">
                                <StatusIcon status={order.status} />
                                {formatOrderStatus(order.status)}
                              </Badge>
                              <div className="flex items-center">
                                <span className="text-yellow-300 font-medium mr-1">{order.credits_amount}</span>
                                <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                              </div>
                            </div>
                            <CardTitle className="text-lg mt-2 flex items-center">
                              {getHoroscopeTypeIcon(order.horoscope_type)}
                              <span className="ml-2">
                                Horoskop {formatHoroscopeType(order.horoscope_type).toLowerCase()}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex items-center text-sm text-indigo-200">
                              <span>Zamówiony: {formatDate(order.created_at)}</span>
                            </div>
                            {order.astrologer && (
                              <div className="flex items-center mt-3">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                                  {order.astrologer.profile_image_url ? (
                                    <img 
                                      src={order.astrologer.profile_image_url} 
                                      alt={order.astrologer.display_name} 
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-xs">
                                      {order.astrologer.display_name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <span className="text-indigo-100">{order.astrologer.display_name}</span>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <div className="w-full text-center text-sm text-indigo-300">
                              Kliknij, aby zobaczyć szczegóły
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Dzienne horoskopy */}
              <TabsContent value="daily">
                {horoscopes.filter(h => h.horoscope_type === 'daily').length === 0 ? (
                  <div className="text-center py-12 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
                    <Clock className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <h3 className="text-xl text-white mb-2">Brak dziennych horoskopów</h3>
                    <p className="text-indigo-200 max-w-md mx-auto mb-6">
                      Nie masz jeszcze żadnych dziennych horoskopów. Zamów swój pierwszy dzienny horoskop, aby poznać wpływ gwiazd na nadchodzący dzień.
                    </p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      <Link href="/dashboard/horoscopes/order">
                        Zamów dzienny horoskop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {horoscopes
                      .filter(h => h.horoscope_type === 'daily')
                      .map((horoscope) => (
                        <Link href={`/dashboard/horoscopes/${horoscope.id}`} key={horoscope.id}>
                          <Card className="bg-indigo-900/30 border-indigo-700/30 h-full hover:bg-indigo-800/30 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                {horoscope.title}
                              </CardTitle>
                              <CardDescription className="text-indigo-300">
                                {formatHoroscopeType(horoscope.horoscope_type)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="line-clamp-3 text-indigo-100 mb-2 text-sm">
                                {horoscope.content.substring(0, 120)}...
                              </div>
                              <div className="text-xs text-indigo-300 mt-3">
                                {formatValidityPeriod(horoscope)}
                              </div>
                            </CardContent>
                            <CardFooter>
                              {horoscope.astrologer && (
                                <div className="flex items-center w-full">
                                  <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                                    {horoscope.astrologer.profile_image_url ? (
                                      <img 
                                        src={horoscope.astrologer.profile_image_url} 
                                        alt={horoscope.astrologer.display_name} 
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-xs">
                                        {horoscope.astrologer.display_name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-indigo-200 text-xs">{horoscope.astrologer.display_name}</span>
                                </div>
                              )}
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Pozostałe horoskopy */}
              <TabsContent value="other">
                {horoscopes.filter(h => h.horoscope_type !== 'daily').length === 0 ? (
                  <div className="text-center py-12 bg-indigo-900/20 rounded-lg border border-indigo-300/20">
                    <Sparkles className="h-12 w-12 mx-auto text-indigo-400 mb-4" />
                    <h3 className="text-xl text-white mb-2">Brak innych horoskopów</h3>
                    <p className="text-indigo-200 max-w-md mx-auto mb-6">
                      Nie masz jeszcze horoskopów tygodniowych, miesięcznych ani rocznych. Zamów horoskop na dłuższy okres, aby poznać swoje długoterminowe perspektywy.
                    </p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      <Link href="/dashboard/horoscopes/order">
                        Zamów horoskop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {horoscopes
                      .filter(h => h.horoscope_type !== 'daily')
                      .map((horoscope) => (
                        <Link href={`/dashboard/horoscopes/${horoscope.id}`} key={horoscope.id}>
                          <Card className="bg-indigo-900/30 border-indigo-700/30 h-full hover:bg-indigo-800/30 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                {getHoroscopeTypeIcon(horoscope.horoscope_type)}
                                <span className="ml-2">
                                  {horoscope.title}
                                </span>
                              </CardTitle>
                              <CardDescription className="text-indigo-300">
                                {formatHoroscopeType(horoscope.horoscope_type)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="line-clamp-3 text-indigo-100 mb-2 text-sm">
                                {horoscope.content.substring(0, 120)}...
                              </div>
                              <div className="text-xs text-indigo-300 mt-3">
                                {formatValidityPeriod(horoscope)}
                              </div>
                            </CardContent>
                            <CardFooter>
                              {horoscope.astrologer && (
                                <div className="flex items-center w-full">
                                  <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                                    {horoscope.astrologer.profile_image_url ? (
                                      <img 
                                        src={horoscope.astrologer.profile_image_url} 
                                        alt={horoscope.astrologer.display_name} 
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-xs">
                                        {horoscope.astrologer.display_name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-indigo-200 text-xs">{horoscope.astrologer.display_name}</span>
                                </div>
                              )}
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}