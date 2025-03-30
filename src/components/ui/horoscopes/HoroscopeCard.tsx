import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Horoscope } from '@/types/horoscopes';
import { formatHoroscopeType } from '@/types/horoscopes';
import { getHoroscopeTypeIcon, formatValidityPeriod } from '@/lib/horoscope-utils';

interface HoroscopeCardProps {
  horoscope: Horoscope;
}

export function HoroscopeCard({ horoscope }: HoroscopeCardProps) {
  return (
    <Link href={`/dashboard/horoscopes/${horoscope.id}`} 
          className="block transform transition-transform hover:scale-102">
      <Card className="card-mystical h-full shadow-lg hover:shadow-mystical transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-foreground">
            <span className="text-indigo-400 mr-2">
              {getHoroscopeTypeIcon(horoscope.horoscope_type)}
            </span>
            <span className="truncate">
              {horoscope.title}
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {formatHoroscopeType(horoscope.horoscope_type)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="line-clamp-3 text-foreground mb-2 text-sm">
            {horoscope.content.substring(0, 120)}...
          </div>
          <div className="text-xs text-muted-foreground mt-3 bg-indigo-900/20 px-3 py-1.5 rounded-full inline-block">
            {formatValidityPeriod(horoscope)}
          </div>
        </CardContent>
        <CardFooter>
          {horoscope.astrologer && (
            <div className="flex items-center w-full">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-400/30 shadow-mystical mr-2">
                {horoscope.astrologer.profile_image_url ? (
                  <img 
                    src={horoscope.astrologer.profile_image_url} 
                    alt={horoscope.astrologer.display_name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-600/30 flex items-center justify-center text-md font-medium">
                    {horoscope.astrologer.display_name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground">{horoscope.astrologer.display_name}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
