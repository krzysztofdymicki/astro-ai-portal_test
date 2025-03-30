import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Clock, Award } from 'lucide-react';
import { Astrologer } from '@/types/astrologers';

interface AstrologerCardProps {
  astrologer: Astrologer;
}

export default function AstrologerCard({ astrologer }: AstrologerCardProps) {
  return (
    <Link 
      href={`/astrologers/${astrologer.id}`} 
      className="block transform transition-transform hover:scale-105"
    >
      <Card className="card-mystical h-full shadow-lg hover:shadow-mystical transition-all">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-foreground">
                {astrologer.display_name}
                {astrologer.is_featured && (
                  <Badge className="ml-2 bg-yellow-600/70 text-yellow-100 border-yellow-500/50">
                    <Award className="h-3 w-3 mr-1" />
                    Wyróżniony
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {astrologer.years_of_experience ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {astrologer.years_of_experience} lat doświadczenia
                  </span>
                ) : (
                  "Astrolog"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="flex flex-col items-center">
            {astrologer.profile_image_url ? (
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-indigo-400/30 shadow-mystical">
                <img 
                  src={astrologer.profile_image_url} 
                  alt={astrologer.display_name} 
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full mb-4 bg-indigo-700/30 border-2 border-indigo-400/30 flex items-center justify-center text-3xl shadow-mystical">
                {astrologer.first_name?.[0]}{astrologer.last_name?.[0]}
              </div>
            )}
            
            <p className="text-foreground mb-4 text-center line-clamp-3">
              {astrologer.short_bio || "Specjalista od przepowiedni astralnych i horoskopów."}
            </p>
            
            {astrologer.languages && astrologer.languages.length > 0 && (
              <div className="flex items-center justify-center mt-2 text-muted-foreground text-sm bg-indigo-900/20 px-3 py-1.5 rounded-full">
                <Languages className="h-4 w-4 mr-2" />
                <span>{astrologer.languages.join(', ')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
