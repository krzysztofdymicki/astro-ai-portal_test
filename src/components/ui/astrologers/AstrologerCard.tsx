import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Clock, Award } from 'lucide-react';
import { Astrologer } from '@/types/astrologers';

interface AstrologerCardProps {
  astrologer: Astrologer;
  compact?: boolean;
  onClick?: () => void;
  asButton?: boolean;
}

export default function AstrologerCard({ 
  astrologer, 
  compact = false, 
  onClick,
  asButton = false 
}: AstrologerCardProps) {
  // Card content that's common between both variants
  const CardContentComponent = () => (
    <Card className={`card-mystical h-full shadow-lg hover:shadow-mystical transition-all ${compact ? 'compact-card' : ''}`}>
      <CardHeader className={compact ? 'p-3' : ''}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} text-foreground`}>
              {astrologer.display_name}
              {astrologer.is_featured && (
                <Badge className={`${compact ? 'ml-1 text-xs py-0' : 'ml-2'} bg-yellow-600/70 text-yellow-100 border-yellow-500/50`}>
                  <Award className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
                  {compact ? 'Top' : 'Wyróżniony'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className={compact ? 'text-xs' : ''}>
              {astrologer.years_of_experience ? (
                <span className="flex items-center gap-1">
                  <Clock className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {astrologer.years_of_experience} lat doświadczenia
                </span>
              ) : (
                "Astrolog"
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`flex-grow ${compact ? 'p-3 pt-0' : ''}`}>
        <div className="flex flex-col items-center">
          {astrologer.profile_image_url ? (
            <div className={`relative ${compact ? 'w-20 h-20' : 'w-28 h-28'} rounded-full overflow-hidden mb-3 border-2 border-indigo-400/30 shadow-mystical`}>
              <img 
                src={astrologer.profile_image_url} 
                alt={astrologer.display_name} 
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className={`${compact ? 'w-20 h-20 text-2xl' : 'w-28 h-28 text-3xl'} rounded-full mb-3 bg-indigo-700/30 border-2 border-indigo-400/30 flex items-center justify-center shadow-mystical`}>
              {astrologer.first_name?.[0]}{astrologer.last_name?.[0]}
            </div>
          )}
          
          {compact ? (
            <p className="text-xs text-foreground mb-2 text-center line-clamp-2">
              {astrologer.short_bio || "Specjalista od przepowiedni astralnych i horoskopów."}
            </p>
          ) : (
            <p className="text-foreground mb-4 text-center line-clamp-3">
              {astrologer.short_bio || "Specjalista od przepowiedni astralnych i horoskopów."}
            </p>
          )}
          
          {astrologer.languages && astrologer.languages.length > 0 && !compact && (
            <div className="flex items-center justify-center mt-2 text-muted-foreground text-sm bg-indigo-900/20 px-3 py-1.5 rounded-full">
              <Languages className="h-4 w-4 mr-2" />
              <span>{astrologer.languages.join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Render as button (div with onClick) or as link based on props
  if (asButton || onClick) {
    return (
      <div 
        onClick={onClick}
        className="cursor-pointer transform transition-transform hover:scale-105"
      >
        <CardContentComponent />
      </div>
    );
  }
  
  // Default: render as a link to the astrologer's page
  return (
    <Link 
      href={`/astrologers/${astrologer.id}`}
      className="block transform transition-transform hover:scale-105"
    >
      <CardContentComponent />
    </Link>
  );
}
