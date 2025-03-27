'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  CircleAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export default function PendingHoroscopesPage() {
  const supabase = createClient();
  const { profile } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<HoroscopeOrder[]>([]);
  
  // Symulowane stany zamówień (normalne użycie wywołałoby faktyczny proces)
  const simulateStateChange = async (orderId: string) => {
    // Funkcja symulująca zmianę statusu zamówienia
    // W prawdziwej implementacji, to będzie obsługiwane przez backend
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Wybór następnego stanu
    let nextStatus = '';
    if (order.status === 'pending') {
      nextStatus = 'processing';
    } else if (order.status === 'processing') {
      nextStatus = 'completed';
      
      // W przypadku ukończenia zamówienia, trzeba by utworzyć nowy horoskop
      // Tutaj jest to symulowane
      await simulateCreateHoroscope(order);
    }
    
    if (!nextStatus) return;
    
    try {
      // Aktualizacja statusu w bazie danych
      const { error } = await supabase
        .from('horoscope_orders')
        .update({ 
          status: nextStatus,
          ...(nextStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Aktualizacja lokalnego stanu
      setPendingOrders(prev => 
        prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
      );
      
      toast.success(`Status zamówienia zaktualizowany`, {
        description: `Zamówienie jest teraz ${formatOrderStatus(nextStatus).toLowerCase()}`
      });
      
      // Jeśli kompletne, przekieruj do listy horoskopów po krótkim opóźnieniu
      if (nextStatus === 'completed') {
        setTimeout(() => {
          window.location.href = '/dashboard/horoscopes';
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Nie udało się zaktualizować statusu zamówienia');
    }
  };
  
  // Funkcja symulująca tworzenie nowego horoskopu (używana gdy zamówienie jest ukończone)
  const simulateCreateHoroscope = async (order: HoroscopeOrder) => {
    if (!profile?.id) return;
    
    // Ustal tytuł i treść horoskopu w zależności od typu
    let title = '';
    let content = '';
    let validFrom = new Date();
    let validTo: Date | null = null;
    
    // Ustawienie tytułu i dat ważności
    switch (order.horoscope_type) {
      case 'daily':
        title = `Horoskop na ${validFrom.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        validTo = new Date(validFrom);
        validTo.setDate(validTo.getDate() + 1);
        break;
      case 'weekly':
        title = `Horoskop tygodniowy`;
        validTo = new Date(validFrom);
        validTo.setDate(validTo.getDate() + 7);
        break;
      case 'monthly':
        title = `Horoskop miesięczny`;
        validTo = new Date(validFrom);
        validTo.setMonth(validTo.getMonth() + 1);
        break;
      case 'yearly':
        title = `Horoskop roczny ${validFrom.getFullYear()}`;
        validTo = new Date(validFrom);
        validTo.setFullYear(validTo.getFullYear() + 1);
        break;
      case 'lifetime':
        title = `Analiza życiowa i karmiczna`;
        validTo = null; // Bezterminowy
        break;
    }
    
    // Przygotowanie przykładowej treści horoskopu (w prawdziwej aplikacji byłoby to generowane przez AI)
    const horoscopeContent = generateSampleHoroscope(order.horoscope_type);
    
    try {
      // Dodaj nowy horoskop do bazy danych
      const { error } = await supabase
        .from('horoscopes')
        .insert({
          order_id: order.id,
          user_id: profile.id,
          astrologer_id: order.astrologer_id,
          horoscope_type: order.horoscope_type,
          title: title,
          content: horoscopeContent,
          valid_from: validFrom.toISOString(),
          valid_to: validTo ? validTo.toISOString() : null,
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Error creating horoscope:', error);
      toast.error('Nie udało się utworzyć horoskopu');
    }
  };
  
  // Generowanie przykładowej treści horoskopu (używane w symulacji)
  const generateSampleHoroscope = (type: string): string => {
    const templates = {
      daily: `Dzisiejszy dzień przyniesie Ci wiele pozytywnej energii. Gwiazdy sprzyjają podejmowaniu nowych inicjatyw, szczególnie w sferze zawodowej. Możliwe, że spotkasz osobę, która zainspiruje Cię do zmiany perspektywy na ważną kwestię.

Mars w korzystnym aspekcie do Twojego znaku wzmacnia Twoją pewność siebie i determinację. To dobry moment, aby przełamać bariery, które dotychczas Cię ograniczały.

W relacjach z bliskimi zachowaj otwartość i cierpliwość. Wieczorem możesz odczuć przypływ kreatywności - wykorzystaj ten czas na rozwój osobisty lub hobby.`,

      weekly: `Nadchodzący tydzień będzie dla Ciebie okresem refleksji i wewnętrznych przemian. Wpływ Saturna nauczy Cię cierpliwości i wytrwałości w dążeniu do celów. Początek tygodnia może przynieść drobne przeszkody, ale od środy energia planet będzie Ci sprzyjać.

W pracy czeka Cię interesujący projekt, który pozwoli Ci zabłysnąć. Twoja kreatywność i nieszablonowe podejście zostaną docenione przez przełożonych. 

W weekend Wenus w pozytywnym aspekcie do Twojego znaku sprzyja spotkaniom towarzyskim i romantycznym uniesieniom. To dobry czas, aby odnowić stare przyjaźnie lub pogłębić istniejące relacje. Zadbaj o odpoczynek i regenerację - Twoja energia będzie potrzebna w nadchodzącym tygodniu.`,

      monthly: `Ten miesiąc przyniesie Ci istotne zmiany w kilku obszarach życia. Planeta Jupiter, która wchodzi w pozytywny aspekt z Twoim znakiem, otworzy przed Tobą nowe możliwości rozwoju i ekspansji. To dobry czas na planowanie długoterminowych projektów i inwestycji.

W pierwszym tygodniu miesiąca możesz odczuwać pewne napięcie związane z pracą. Saturn w kwadraturze z Twoim znakiem może przynieść dodatkowe obowiązki i odpowiedzialność. Jednak Twoja determinacja i systematyczność pozwolą Ci sprostać wszystkim wyzwaniom.

Około połowy miesiąca Merkury w trygonie do Twojego znaku sprzyja komunikacji i negocjacjom. To idealny moment na rozmowy o podwyżce lub awansie. Twoje pomysły będą jasne i przekonujące.

W sferze uczuciowej Wenus przynosi harmonię i pogłębienie relacji. Osoby w stałych związkach odkryją nowe wymiary bliskości, a single mają szansę na poznanie kogoś wyjątkowego w trzecim tygodniu miesiąca.

Końcówka miesiąca to czas spokoju i wyciszenia. Księżyc w koniunkcji z Twoim znakiem wzmocni Twoją intuicję i wrażliwość. Wykorzystaj ten czas na medytację i regenerację sił.`,

      yearly: `Nadchodzący rok będzie dla Ciebie przełomowy. Ustawienie planet wskazuje na znaczące zmiany w kluczowych obszarach Twojego życia, które przyniosą długotrwałe korzyści.

Pierwsza połowa roku upłynie pod znakiem Saturna, który nauczy Cię dyscypliny i cierpliwości. To świetny czas na budowanie solidnych fundamentów dla przyszłości. W pracy czeka Cię awans lub nowe możliwości, ale tylko jeśli będziesz gotów/gotowa ciężko pracować i przyjąć na siebie większą odpowiedzialność.

Czerwiec i lipiec przyniosą przełom w sprawach finansowych. Wpływ Jowisza w Twoim sektorze finansowym może przynieść nieoczekiwane źródła dochodu lub inwestycje, które zaowocują w przyszłości. Bądź jednak ostrożny/a i nie podejmuj nadmiernego ryzyka.

W życiu osobistym czeka Cię ważna transformacja. Osoby w związkach przejdą na wyższy poziom relacji, możliwe zaręczyny, ślub lub powiększenie rodziny. Single mają szansę na spotkanie prawdziwej miłości, szczególnie w okolicach listopada, gdy Wenus wejdzie w pozytywny aspekt z Twoim znakiem.

Zdrowie będzie wymagało szczególnej uwagi w okresie jesiennym. Zwróć uwagę na regularny odpoczynek i właściwą dietę. Praktyki medytacyjne i ćwiczenia fizyczne pomogą Ci utrzymać równowagę energetyczną.

Koniec roku przyniesie czas refleksji i planowania. To dobry moment, aby podsumować swoje osiągnięcia i wyznaczyć cele na przyszły rok. Ogólna energia kosmiczna sprzyja duchowemu rozwojowi i odkrywaniu głębszych prawd o sobie i wszechświecie.`,

      lifetime: `Analiza Twojej karty astralnej ujawnia fascynujący wzorzec energii i potencjału, który kształtuje Twoją życiową podróż. Twój ascendent w połączeniu z pozycją Słońca wskazuje na wyjątkową zdolność do transformacji i adaptacji, co jest jednym z Twoich największych darów.

Dominująca energia Twojego znaku zodiaku daje Ci wrodzoną zdolność do [cecha charakterystyczna znaku]. To kluczowa siła, która będzie prowadzić Cię przez całe życie, szczególnie w momentach podejmowania ważnych decyzji.

Saturn w Twoim domu kariery wskazuje na stopniowy, ale solidny rozwój zawodowy. Twoja życiowa ścieżka kariery może początkowo wydawać się wymagająca, ale z czasem przyniesie stabilność i uznanie. Największe sukcesy zawodowe osiągniesz między 35 a 45 rokiem życia, gdy tranzyt Jowisza wzmocni Twój potencjał przywódczy.

W sferze relacji, pozycja Wenus w Twojej karcie sugeruje głęboką potrzebę autentyczności i znaczących połączeń. Możesz doświadczyć kilku intensywnych związków w pierwszej połowie życia, ale to połączenie, które nawiążesz w wieku dojrzałym, będzie miało największy wpływ na Twoje szczęście i rozwój osobisty.

Układ Księżyca w Twoim domu rodzinnym wskazuje na silne więzi rodzinne i potrzebę tworzenia harmonijnego środowiska domowego. Twoja rola jako opiekuna lub mentora będzie kluczowym aspektem Twojej tożsamości.

Merkury w Twoim domu komunikacji obdarza Cię wyjątkowymi zdolnościami wyrażania myśli i idei. W ciągu życia rozwiniesz ten talent, możliwe że poprzez pisanie, nauczanie lub inne formy komunikacji, które pozwolą Ci wpływać na innych.

Z karmicznego punktu widzenia, węzeł północny w Twoim znaku sugeruje, że Twoim życiowym zadaniem jest rozwinięcie [cecha do rozwinięcia]. Dusze, które spotykasz na swojej drodze, szczególnie te, z którymi doświadczasz intensywnych relacji, są częścią Twojego karmicznego planu rozwoju.

Cykle planetarne wskazują na trzy kluczowe okresy transformacji w Twoim życiu: około 29-30 roku życia (powrót Saturna), 40-42 roku życia (tranzyt Uranusa) i 56-58 roku życia (drugi powrót Saturna). Te okresy, choć mogą być wymagające, przyniosą najgłębsze zrozumienie Twojego celu i potencjału.

Twoja życiowa podróż jest wyjątkowa i pełna potencjału. Gwiazdy nie determinują Twojego losu, ale oferują mapę możliwości i wyzwań. To, jak wykorzystasz kosmiczne wpływy, zależy od Twojej świadomości i wyborów, które codziennie podejmujesz.`
    };
    
    return templates[type as keyof typeof templates] || templates.daily;
  };
  
  // Pobieranie zamówień użytkownika
  useEffect(() => {
    const fetchOrders = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      try {
        // Pobierz oczekujące zamówienia
        const { data, error } = await supabase
          .from('horoscope_orders')
          .select(`
            *,
            astrologer:astrologers(display_name, profile_image_url)
          `)
          .eq('user_id', profile.id)
          .not('status', 'eq', 'completed')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setPendingOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Nie udało się pobrać zamówień');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Symulacja automatycznej zmiany statusu dla demonstracji
    // W produkcji byłoby to obsługiwane przez serwer
    const interval = setInterval(() => {
      // Znajdź jedno zamówienie do aktualizacji
      const pendingOrder = pendingOrders.find(o => o.status === 'pending');
      if (pendingOrder) {
        simulateStateChange(pendingOrder.id);
        return;
      }
      
      const processingOrder = pendingOrders.find(o => o.status === 'processing');
      if (processingOrder) {
        simulateStateChange(processingOrder.id);
        return;
      }
    }, 15000); // Co 15 sekund (w produkcji byłby inny mechanizm)
    
    return () => clearInterval(interval);
  }, [profile, supabase, pendingOrders]);
  
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
  
  // Obliczenie szacowanego czasu przygotowania
  const getEstimatedTime = (order: HoroscopeOrder): { minutes: number, text: string } => {
    let minutes = 0;
    
    switch (order.horoscope_type) {
      case 'daily':
        minutes = 30;
        break;
      case 'weekly':
        minutes = 120;
        break;
      case 'monthly':
        minutes = 360;
        break;
      case 'yearly':
        minutes = 1440;
        break;
      case 'lifetime':
        minutes = 4320;
        break;
      default:
        minutes = 60;
    }
    
    if (minutes < 60) {
      return { minutes, text: `${minutes} minut` };
    } else if (minutes < 1440) {
      const hours = minutes / 60;
      return { minutes, text: `${hours} ${hours === 1 ? 'godzina' : hours < 5 ? 'godziny' : 'godzin'}` };
    } else {
      const days = minutes / 1440;
      return { minutes, text: `${days} ${days === 1 ? 'dzień' : 'dni'}` };
    }
  };
  
  // Obliczenie postępu przygotowania horoskopu
  const calculateProgress = (order: HoroscopeOrder): number => {
    if (order.status === 'pending') return 0;
    if (order.status === 'completed') return 100;
    
    // Dla horoskopów w trakcie przygotowania oblicz postęp czasowy
    const createdAt = new Date(order.created_at).getTime();
    const now = new Date().getTime();
    const estimatedMinutes = getEstimatedTime(order).minutes;
    const estimatedCompletion = createdAt + (estimatedMinutes * 60 * 1000);
    
    // Oblicz procent ukończenia
    const elapsed = now - createdAt;
    const total = estimatedCompletion - createdAt;
    let percentComplete = Math.floor((elapsed / total) * 100);
    
    // Ogranicz do zakresu 0-95% (100% tylko dla ukończonych)
    return Math.max(0, Math.min(95, percentComplete));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/dashboard/horoscopes" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Zamówienia w trakcie realizacji</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : pendingOrders.length === 0 ? (
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
        <div className="space-y-8">
          {pendingOrders.map((order) => (
            <Card 
              key={order.id} 
              id={order.id}
              className="bg-indigo-900/30 border-indigo-700/30"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <Badge className={`
                      ${order.status === 'pending' ? 'bg-yellow-600/70 text-yellow-100 border-yellow-500/50' : 
                        order.status === 'processing' ? 'bg-blue-600/70 text-blue-100 border-blue-500/50' : 
                        'bg-green-600/70 text-green-100 border-green-500/50'} 
                      flex items-center gap-1 mb-2
                    `}>
                      <StatusIcon status={order.status} />
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <CardTitle className="text-xl flex items-center">
                      {getHoroscopeTypeIcon(order.horoscope_type)}
                      <span className="ml-2">
                        Horoskop {formatHoroscopeType(order.horoscope_type).toLowerCase()}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex items-center">
                    <div className="text-center mr-4">
                      <div className="text-xs text-indigo-300 mb-1">Koszt</div>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold text-yellow-300 mr-1">{order.credits_amount}</span>
                        <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      </div>
                    </div>
                    {/* Data zamówienia */}
                    <div className="text-center">
                      <div className="text-xs text-indigo-300 mb-1">Zamówiony</div>
                      <div className="text-sm">{formatDate(order.created_at)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Astrolog */}
                  {order.astrologer && (
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        {order.astrologer.profile_image_url ? (
                          <img 
                            src={order.astrologer.profile_image_url} 
                            alt={order.astrologer.display_name} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center text-md">
                            {order.astrologer.display_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-indigo-300">Astrolog</div>
                        <div className="font-medium">{order.astrologer.display_name}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status informacje */}
                  <div className="bg-indigo-900/40 border border-indigo-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Status zamówienia</h3>
                    
                    {/* Pasek postępu */}
                    <div className="mb-4">
                      <div className="w-full bg-indigo-950/60 rounded-full h-2.5 mb-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-500' : 
                            order.status === 'processing' ? 'bg-blue-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${calculateProgress(order)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-indigo-300">
                        <span>Zamówienie złożone</span>
                        <span>Przygotowanie</span>
                        <span>Ukończone</span>
                      </div>
                    </div>
                    
                    {/* Statusy */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          order.status !== 'pending' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-800/50 text-indigo-400'
                        }`}>
                          {order.status !== 'pending' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">1</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Zamówienie złożone</div>
                          <div className="text-sm text-indigo-300">{formatDate(order.created_at)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' : 
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                          'bg-indigo-800/50 text-indigo-400'
                        }`}>
                          {order.status === 'processing' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : order.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">2</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">W trakcie przygotowania</div>
                          <div className="text-sm text-indigo-300">
                            {order.status === 'pending' ? (
                              'Oczekuje na rozpoczęcie'
                            ) : order.status === 'processing' ? (
                              <>Astrolog pracuje nad Twoim horoskopem</>
                            ) : (
                              'Ukończono'
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-800/50 text-indigo-400'
                        }`}>
                          {order.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">3</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Horoskop gotowy</div>
                          <div className="text-sm text-indigo-300">
                            {order.status === 'completed' ? (
                              <>Dostępny w sekcji "Twoje horoskopy"</>
                            ) : (
                              <>Szacowany czas: {getEstimatedTime(order).text}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informacja o czasie oczekiwania */}
                  {order.status !== 'completed' && (
                    <div className="bg-indigo-800/20 border border-indigo-700/20 rounded-lg p-4 text-center">
                      <p className="text-indigo-200">
                        {order.status === 'pending' ? (
                          <>Astrolog wkrótce rozpocznie pracę nad Twoim horoskopem.</>
                        ) : (
                          <>Astrolog pracuje nad Twoim horoskopem. To zajmie około {getEstimatedTime(order).text}.</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-end">
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Link href="/dashboard/horoscopes">
                      Powrót do horoskopów
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}