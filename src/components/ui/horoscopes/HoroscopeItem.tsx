import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Horoscope, HoroscopeOrder, formatHoroscopeType, formatOrderStatus } from '@/types/horoscopes';
import { Star, Calendar, Clock, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { StatusIcon } from '@/lib/horoscope-utils';

// Typ generyczny pozwalający na przekazanie zarówno Horoscope jak i HoroscopeOrder
type HoroscopeItemProps = {
  item: Horoscope | HoroscopeOrder;
  variant?: 'default' | 'compact';
};

// Funkcja pomocnicza do sprawdzania typu obiektu
const isHoroscope = (item: Horoscope | HoroscopeOrder): item is Horoscope => {
  return 'content' in item && 'title' in item;
};

export function HoroscopeItem({ item, variant = 'default' }: HoroscopeItemProps) {
  const router = useRouter();
  const isPending = !isHoroscope(item);
  const astrologer = (item.astrologer as any) || {};
  
  // Wspólne dane niezależnie od typu
  const itemType = isHoroscope(item) ? item.horoscope_type : item.horoscope_type;
  const zodiacSign = isHoroscope(item) ? item.zodiac_sign : item.zodiac_sign;
  const createdDate = formatDate(item.created_at);
  
  // Dane specyficzne dla zamówienia (HoroscopeOrder)
  const orderStatus = isPending ? formatOrderStatus(item.status) : null;
  
  // Obsługa kliknięcia
  const handleClick = () => {
    if (isHoroscope(item)) {
      router.push(`/dashboard/horoscopes/${item.id}`);
    } else {
      router.push(`/dashboard/horoscopes/pending#${item.id}`);
    }
  };
  
  // Określenie koloru tła nagłówka na podstawie statusu lub typu
  const getHeaderBgClass = () => {
    if (isPending) {
      switch(item.status) {
        case 'pending': return 'from-amber-900/70 to-amber-800/70';
        case 'processing': return 'from-blue-900/70 to-blue-800/70';
        case 'completed': return 'from-green-900/70 to-green-800/70';
        case 'cancelled': return 'from-red-900/70 to-red-800/70';
        default: return 'from-indigo-900/70 to-violet-900/70';
      }
    }
    return 'from-indigo-900/70 to-violet-900/70';
  };

  return (
    <div 
      onClick={handleClick}
      className="card-mystical border border-indigo-700/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-mystical-hover cursor-pointer h-full flex flex-col"
    >
      <div className={`p-4 bg-gradient-to-r ${getHeaderBgClass()} border-b border-indigo-700/30`}>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-white mystical-glow truncate">
            {isHoroscope(item) ? (
              item.title
            ) : (
              `Horoskop ${formatHoroscopeType(item.horoscope_type).toLowerCase()}`
            )}
          </h3>
          
          {isPending && (
            <Badge className={`ml-2 ${
              item.status === 'pending' ? 'bg-amber-600/70 border-amber-500/50' :
              item.status === 'processing' ? 'bg-blue-600/70 border-blue-500/50' :
              item.status === 'completed' ? 'bg-green-600/70 border-green-500/50' :
              'bg-red-600/70 border-red-500/50'
            } text-white`}>
              <StatusIcon status={item.status} />
              <span className="ml-1">{orderStatus}</span>
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
          <div className="flex items-center text-indigo-200">
            <Star className="h-4 w-4 mr-1" />
            <span className="text-sm">{zodiacSign}</span>
          </div>
          
          <div className="flex items-center text-indigo-200">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{formatHoroscopeType(itemType)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-950/20 flex-grow flex flex-col">
        {isHoroscope(item) ? (
          // Zawartość dla gotowego horoskopu
          <p className="text-gray-200 line-clamp-3 mb-4 flex-grow">
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
              <div className="bg-indigo-900/30 p-3 rounded border border-indigo-600/20 mb-3">
                <p className="text-sm text-indigo-200 mb-1 font-medium">Twoje uwagi:</p>
                <p className="text-gray-200 text-sm line-clamp-2">{item.user_notes}</p>
              </div>
            ) : null}
            
            <div className="flex items-center text-indigo-200 mb-2">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {item.status === 'pending' ? 'Oczekuje na przygotowanie' : 
                 item.status === 'processing' ? 'Astrolog pracuje nad Twoim horoskopem' :
                 item.status === 'completed' ? 'Horoskop jest gotowy do odbioru' :
                 'Zamówienie zostało anulowane'}
              </span>
            </div>
            
            {item.credits_amount && (
              <div className="flex items-center text-amber-300 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Wykorzystane kredyty: {item.credits_amount}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-indigo-700/30 mt-auto">
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
            <span className="text-sm text-indigo-300">{astrologer?.display_name || 'Astrolog'}</span>
          </div>
          
          <div className="flex items-center text-indigo-300 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>{createdDate}</span>
          </div>
        </div>
        
        <div className="text-right mt-2">
          <span className="text-indigo-400 text-xs flex items-center justify-end hover:text-indigo-300">
            Zobacz szczegóły <ChevronRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </div>
    </div>
  );
}