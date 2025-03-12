'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, MessageCircle, Search, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Astrologer, AstrologerSpecialty } from '@/types/astrologer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyAstrologersPage() {
  const router = useRouter();
  const { userEmail } = useUser();
  
  const [favoriteAstrologers, setFavoriteAstrologers] = useState<Astrologer[]>([]);
  const [recentAstrologers, setRecentAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pobranie danych o ulubionych i ostatnio przeglądanych astrologach
  useEffect(() => {
    const fetchMyAstrologers = async () => {
      setIsLoading(true);
      
      try {
        // Pobierz ulubione
        const favoritesResponse = await fetch('/api/astrologers/favorites');
        if (!favoritesResponse.ok) throw new Error('Błąd pobierania ulubionych astrologów');
        
        const favoritesData = await favoritesResponse.json();
        setFavoriteAstrologers(favoritesData);
        
        // Pobierz ostatnio przeglądanych (z localStorage)
        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewedAstrologers') || '[]');
        
        if (recentlyViewedIds.length > 0) {
          // Pobierz dane dla ostatnio przeglądanych
          const recentlyViewedPromises = recentlyViewedIds.map((id: string) => 
            fetch(`/api/astrologers/${id}`).then(res => res.json())
          );
          
          const recentlyViewedData = await Promise.all(recentlyViewedPromises);
          setRecentAstrologers(recentlyViewedData);
        }
      } catch (error) {
        console.error('Błąd:', error);
        toast.error('Nie udało się pobrać listy astrologów');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyAstrologers();
  }, []);
  
  // Filtrowanie astrologów po zapytaniu
  const filteredFavorites = favoriteAstrologers.filter(astrologer =>
    astrologer.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (astrologer.short_bio && astrologer.short_bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredRecent = recentAstrologers.filter(astrologer =>
    astrologer.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (astrologer.short_bio && astrologer.short_bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Funkcja do obsługi usuwania z ulubionych
  const removeFromFavorites = async (astrologerId: string) => {
    try {
      const response = await fetch('/api/astrologers/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          astrologerId,
          action: 'remove',
        }),
      });
      
      if (!response.ok) throw new Error('Błąd usuwania z ulubionych');
      
      // Aktualizacja stanu lokalnie
      setFavoriteAstrologers(prev => 
        prev.filter(a => a.id !== astrologerId)
      );
      
      toast.success('Usunięto z ulubionych');
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się usunąć z ulubionych');
    }
  };
  
  // Renderowanie karty astrologa
  const renderAstrologerCard = (astrologer: Astrologer, isFavorite: boolean = false) => (
    <Card key={astrologer.id} className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all overflow-hidden">
      {/* Obrazek astrologa */}
      <div className="relative w-full h-40 overflow-hidden">
        {astrologer.profile_image_url ? (
          <Image
            src={astrologer.profile_image_url}
            alt={astrologer.display_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-800/50">
            <span className="text-4xl">🔮</span>
          </div>
        )}
        
        {/* Przycisk ulubione */}
        {isFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full bg-black/30 hover:bg-black/50 hover:text-red-300 text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeFromFavorites(astrologer.id);
            }}
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          </Button>
        )}
      </div>
      
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{astrologer.display_name}</CardTitle>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm">
              {astrologer.rating_average.toFixed(1)}
            </span>
          </div>
        </div>
        <CardDescription className="text-indigo-200 text-xs flex items-center gap-1">
          {astrologer.years_of_experience && (
            <span>{astrologer.years_of_experience} lat doświadczenia</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-0">
        {/* Wyświetlenie specjalizacji */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(astrologer.astrologer_specialties || []).slice(0, 3).map((spec: AstrologerSpecialty) => (
            <Badge key={spec.id} variant="outline" className="bg-indigo-800/40 border-indigo-400/30 text-xs">
              {spec.specialty?.name}
            </Badge>
          ))}
          {(astrologer.astrologer_specialties || []).length > 3 && (
            <Badge variant="outline" className="bg-indigo-800/40 border-indigo-400/30 text-xs">
              +{(astrologer.astrologer_specialties || []).length - 3} więcej
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="border-indigo-400/30 hover:bg-indigo-800/50"
          onClick={() => router.push(`/dashboard/consultations/new?astrologer=${astrologer.id}`)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Konsultacja
        </Button>
        <Link href={`/astrologers/${astrologer.id}`} className="w-full">
          <Button className="w-full bg-indigo-700 hover:bg-indigo-600">
            Zobacz profil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white mystical-glow">
          Moi Astrologowie
        </h1>
        <Link 
          href="/astrologers" 
          className="text-indigo-300 hover:text-indigo-200 flex items-center"
        >
          Przeglądaj wszystkich
        </Link>
      </div>
      
      {/* Pasek wyszukiwania */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" size={18} />
        <Input
          placeholder="Szukaj wśród twoich astrologów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-indigo-950/40 border-indigo-400/30 text-white"
        />
      </div>
      
      {/* Zawartość w kartach */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="bg-indigo-800/50 border-indigo-300/30 mb-6">
          <TabsTrigger value="favorites" className="data-[state=active]:bg-indigo-700/70">
            Ulubione
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-indigo-700/70">
            Ostatnio przeglądane
          </TabsTrigger>
        </TabsList>
        
        {/* Ulubione */}
        <TabsContent value="favorites">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-indigo-900/40 border-indigo-300/30 overflow-hidden">
                  <div className="w-full h-40 bg-indigo-800/50">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12 bg-indigo-900/20 rounded-lg">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Brak wyników wyszukiwania' : 'Nie masz jeszcze ulubionych astrologów'}
              </h3>
              <p className="text-indigo-300 mb-6">
                {searchQuery 
                  ? 'Spróbuj zmienić kryteria wyszukiwania.' 
                  : 'Dodaj astrologa do ulubionych, aby mieć do niego szybki dostęp.'}
              </p>
              <Button 
                onClick={() => router.push('/astrologers')} 
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Przeglądaj astrologów
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredFavorites.map(astrologer => renderAstrologerCard(astrologer, true))}
            </div>
          )}
        </TabsContent>
        
        {/* Ostatnio przeglądane */}
        <TabsContent value="recent">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-indigo-900/40 border-indigo-300/30 overflow-hidden">
                  <div className="w-full h-40 bg-indigo-800/50">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredRecent.length === 0 ? (
            <div className="text-center py-12 bg-indigo-900/20 rounded-lg">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Brak wyników wyszukiwania' : 'Nie przeglądałeś jeszcze żadnych astrologów'}
              </h3>
              <p className="text-indigo-300 mb-6">
                {searchQuery 
                  ? 'Spróbuj zmienić kryteria wyszukiwania.' 
                  : 'Przeglądaj profile astrologów, aby zobaczyć je tutaj.'}
              </p>
              <Button 
                onClick={() => router.push('/astrologers')} 
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Przeglądaj astrologów
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredRecent.map(astrologer => renderAstrologerCard(astrologer, favoriteAstrologers.some(fav => fav.id === astrologer.id)))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}