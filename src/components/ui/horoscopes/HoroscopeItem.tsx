import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Horoscope, HoroscopeOrder, formatHoroscopeType, formatOrderStatus } from '@/types/horoscopes';
import { Star, Calendar, Clock, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusIcon } from '@/lib/horoscope-utils';

// Typ generyczny pozwalający na przekazanie zarówno Horoscope jak i HoroscopeOrder
type HoroscopeItemProps = {
  item: Horoscope | HoroscopeOrder;
  variant?: 'default' | 'compact';
  onRefresh?: () => void;
};

// Funkcja pomocnicza do sprawdzania typu obiektu
const isHoroscope = (item: Horoscope | HoroscopeOrder): item is Horoscope => {
  return 'content' in item && 'title' in item;
};

export function HoroscopeItem({ item, variant = 'default', onRefresh }: HoroscopeItemProps) {
  const router = useRouter();
  const isPending = !isHoroscope(item);
  const astrologer = (item.astrologer as any) || {};
  
  // Wspólne dane niezależnie od typu
  const itemType = isHoroscope(item) ? item.horoscope_type : item.horoscope_type;
  const zodiacSign = isHoroscope(item) ? item.zodiac_sign : item.zodiac_sign;
  const createdDate = formatDate(item.created_at);
  
  // Dane specyficzne dla zamówienia (HoroscopeOrder)
  const orderStatus = isPending ? formatOrderStatus(item.status) : null;
  
  // Obsługa kliknięcia - tylko dla gotowych horoskopów lub zamówień o statusie innym niż "pending"
  const isClickable = isHoroscope(item) || (isPending && item.status !== 'pending');
  
  const handleClick = () => {
    if (!isClickable) return;
    
    if (isHoroscope(item)) {
      router.push(`/dashboard/horoscopes/${item.id}`);
    } else if (item.status === 'completed') {
      // Dla zamówień ze statusem 'completed' kierujemy do strony szczegółowej
      router.push(`/dashboard/horoscopes/${item.horoscope_id || item.id}`);
    }
  };
  
  // Określenie koloru badge na podstawie statusu
  const getStatusBadgeClass = () => {
    if (!isPending) return "";
    
    switch(item.status) {
      case 'pending': return 'bg-amber-600/70 border-amber-500/50 text-white';
      case 'processing': return 'bg-blue-600/70 border-blue-500/50 text-white';
      case 'completed': return 'bg-green-600/70 border-green-500/50 text-white';
      case 'cancelled': return 'bg-red-600/70 border-red-500/50 text-white';
      default: return 'bg-indigo-600/70 border-indigo-500/50 text-white';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'} transform transition-transform`}
    >
      <Card className="card-mystical h-full shadow-lg hover:shadow-mystical transition-all">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-foreground">
                {isHoroscope(item) ? (
                  item.title
                ) : (
                  `Horoskop ${formatHoroscopeType(item.horoscope_type).toLowerCase()}`
                )}
                
                {isPending && (
                  <Badge className={`ml-2 ${getStatusBadgeClass()}`}>
                    <StatusIcon status={item.status} />
                    <span className="ml-1">{orderStatus}</span>
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Star className="h-4 w-4 mr-1 text-amber-400" />
                  <span>{zodiacSign}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-indigo-400" />
                  <span>{formatHoroscopeType(itemType)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="flex flex-col h-full">
            {isHoroscope(item) ? (
              // Zawartość dla gotowego horoskopu
              <p className="text-foreground line-clamp-3 mb-4 flex-grow">
                {item.content ? (
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' 
                  }} />
                ) : (
                  'Brak treści horoskopu.'
                )}
              </p>
            ) : (
              // Zawartość dla zamówienia w trakcie realizacji
              <div className="mb-4 flex-grow">
                {item.user_notes ? (
                  <div className="bg-accent/30 p-3 rounded-md border border-accent/20 mb-3">
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Twoje uwagi:</p>
                    <p className="text-foreground text-sm line-clamp-2">{item.user_notes}</p>
                  </div>
                ) : null}
                
                <div className="flex items-center text-muted-foreground mb-2">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {item.status === 'pending' ? 'Oczekuje na przygotowanie' : 
                    item.status === 'processing' ? 'Astrolog pracuje nad Twoim horoskopem' :
                    item.status === 'completed' ? 'Horoskop jest gotowy do odbioru' :
                    'Zamówienie zostało anulowane'}
                  </span>
                </div>
                
                {item.credits_amount && (
                  <div className="flex items-center text-amber-500 text-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Wykorzystane kredyty: {item.credits_amount}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4 mt-auto border-t border-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {astrologer?.profile_image_url ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 border border-indigo-400/30">
                      <img
                        src={astrologer.profile_image_url}
                        alt={astrologer.display_name || 'Astrolog'}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-700/30 border border-indigo-400/30 flex items-center justify-center text-xs text-white mr-2">
                      {astrologer?.display_name?.[0] || 'A'}
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">{astrologer?.display_name || 'Astrolog'}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{createdDate}</span>
                </div>
              </div>
              
              {isClickable && (
                <div className="text-right mt-3">
                  <span className="text-indigo-400 text-xs flex items-center justify-end hover:text-indigo-300">
                    Zobacz szczegóły <ChevronRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}