import { Horoscope, formatHoroscopeType } from '@/types/horoscopes';
import { Star, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HoroscopeCardProps {
  horoscope: Horoscope;
}

export function HoroscopeCard({ horoscope }: HoroscopeCardProps) {
  const router = useRouter();
  const astrologer = horoscope.astrologer as any;
  
  const handleCardClick = () => {
    router.push(`/dashboard/horoscopes/${horoscope.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="card-mystical border border-indigo-700/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-mystical-hover cursor-pointer"
    >
      <div className="p-4 bg-gradient-to-r from-indigo-900/70 to-violet-900/70 border-b border-indigo-700/30">
        <h3 className="text-xl font-semibold text-white mystical-glow truncate">{horoscope.title}</h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-indigo-200">
            <Star className="h-4 w-4 mr-1" />
            <span className="text-sm">{horoscope.zodiac_sign}</span>
          </div>
          
          <div className="flex items-center text-indigo-200">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{formatHoroscopeType(horoscope.horoscope_type)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-950/20">
        <p className="text-gray-200 line-clamp-3 mb-4">
          {horoscope.content ? (
            <span dangerouslySetInnerHTML={{ 
              __html: horoscope.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' 
            }} />
          ) : (
            'Brak treści horoskopu.'
          )}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-indigo-700/30">
          <div className="flex items-center">
            {astrologer?.profile_image_url && (
              <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 border border-indigo-400/30">
                <Image
                  src={astrologer.profile_image_url}
                  alt={astrologer.display_name || 'Astrolog'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-sm text-indigo-300">{astrologer?.display_name || 'Astrolog'}</span>
          </div>
          
          <div className="flex items-center text-indigo-300 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDate(horoscope.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}