import { 
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
import { Horoscope, HoroscopeType, HoroscopeOrderStatus } from '@/types/horoscopes';

/**
 * Returns the appropriate icon for a horoscope type
 */
export const getHoroscopeTypeIcon = (type: HoroscopeType) => {
  switch (type) {
    case 'daily': return <Clock className="h-5 w-5" />;
    case 'weekly': return <Calendar className="h-5 w-5" />;
    case 'monthly': return <CalendarRange className="h-5 w-5" />;
    case 'yearly': return <HistoryIcon className="h-5 w-5" />;
    case 'lifetime': return <Sparkles className="h-5 w-5" />;
    default: return <Star className="h-5 w-5" />;
  }
};

/**
 * Component that displays an icon based on order status
 */
export const StatusIcon = ({ status }: { status: HoroscopeOrderStatus | string }) => {
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

/**
 * Formats a date string to a localized format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formats the validity period of a horoscope
 */
export const formatValidityPeriod = (horoscope: Horoscope): string => {
  if (!horoscope.valid_from) return 'Bez określonej daty ważności';
  
  if (!horoscope.valid_to) {
    return `Od ${formatDate(horoscope.valid_from)}`;
  }
  
  return `${formatDate(horoscope.valid_from)} - ${formatDate(horoscope.valid_to)}`;
};
