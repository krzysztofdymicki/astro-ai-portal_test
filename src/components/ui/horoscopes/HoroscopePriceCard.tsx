import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { getHoroscopeTypeIcon } from '@/lib/horoscope-utils';
import { formatHoroscopeType } from '@/types/horoscopes';
import type { AstrologerHoroscopePrice } from '@/types/astrologers';

interface HoroscopePriceCardProps { 
  price: AstrologerHoroscopePrice;
  onSelect: () => void;
  userHasEnoughCredits: boolean;
}

export default function HoroscopePriceCard({ 
  price, 
  onSelect,
  userHasEnoughCredits
}: HoroscopePriceCardProps) {
  return (
    <Card 
      className={`bg-indigo-900/60 border border-indigo-500/30 ${
        userHasEnoughCredits 
          ? 'hover:bg-indigo-800/70 cursor-pointer hover:border-indigo-500/50' 
          : 'opacity-70 cursor-not-allowed'
      } transition-all rounded-lg shadow-md`}
      onClick={userHasEnoughCredits ? onSelect : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-indigo-200">
              {getHoroscopeTypeIcon(price.horoscope_type)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                Horoskop {formatHoroscopeType(price.horoscope_type).toLowerCase()}
              </h3>
              <p className="text-indigo-200 text-sm">
                {price.description || `Horoskop ${formatHoroscopeType(price.horoscope_type).toLowerCase()} przygotowany specjalnie dla Ciebie`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <span className="text-white font-bold text-xl mr-2">{price.credits_price}</span>
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            
            <Button 
              className={`${
                userHasEnoughCredits 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                  : 'bg-indigo-700/50 text-indigo-200 cursor-not-allowed'
              }`}
              disabled={!userHasEnoughCredits}
            >
              {userHasEnoughCredits ? 'Wybierz' : 'Za mało kredytów'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
