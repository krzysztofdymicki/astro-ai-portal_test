'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter, Search, X, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Astrologer, Specialty } from '@/types/astrologer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AstrologersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userEmail } = useUser();
  const isLoggedIn = !!userEmail;
  
  // Stan
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtry
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<string>('0');
  const [minExperience, setMinExperience] = useState<string>('0');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pobieranie parametrów z URL
  useEffect(() => {
    const specialty = searchParams.get('specialty');
    const rating = searchParams.get('rating');
    const experience = searchParams.get('experience');
    const query = searchParams.get('query');
    
    if (specialty) setSelectedSpecialties([specialty]);
    if (rating) setMinRating(rating);
    if (experience) setMinExperience(experience);
    if (query) setSearchQuery(query);
  }, [searchParams]);
  
  // Pobranie astrologów i specjalizacji
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch('/api/specialties');
        if (!response.ok) throw new Error('Błąd pobierania specjalizacji');
        const data = await response.json();
        setSpecialties(data);
      } catch (error) {
        console.error('Błąd:', error);
        toast.error('Nie udało się pobrać specjalizacji');
      }
    };
    
    fetchSpecialties();
    fetchAstrologers();
  }, []);
  
  // Pobranie astrologów z uwzględnieniem filtrów
  const fetchAstrologers = async () => {
    setIsLoading(true);
    
    try {
      // Budowanie parametrów zapytania
      const params = new URLSearchParams();
      
      if (selectedSpecialties.length > 0) {
        selectedSpecialties.forEach(specialty => {
          params.append('specialty', specialty);
        });
      }
      
      if (parseInt(minRating) > 0) {
        params.append('minRating', minRating);
      }
      
      if (parseInt(minExperience) > 0) {
        params.append('minExperience', minExperience);
      }
      
      if (searchQuery.trim()) {
        params.append('query', searchQuery);
      }
      
      const response = await fetch(`/api/astrologers?${params.toString()}`);
      if (!response.ok) throw new Error('Błąd pobierania astrologów');
      
      const data = await response.json();
      setAstrologers(data);
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się pobrać listy astrologów');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obsługa zmiany filtrów
  const handleFilterChange = () => {
    fetchAstrologers();
  };
  
  // Funkcja do obsługi dodawania/usuwania ulubionych
  const toggleFavorite = async (astrologerId: string, isFavorite: boolean) => {
    if (!isLoggedIn) {
      toast.error('Musisz być zalogowany, aby dodać astrologa do ulubionych');
      return;
    }
    
    try {
      const response = await fetch('/api/astrologers/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          astrologerId,
          action: isFavorite ? 'remove' : 'add',
        }),
      });
      
      if (!response.ok) throw new Error('Błąd aktualizacji ulubionych');
      
      // Aktualizacja stanu lokalnie
      setAstrologers(prev => 
        prev.map(a => 
          a.id === astrologerId 
            ? { ...a, is_favorite: !isFavorite } 
            : a
        )
      );
      
      toast.success(isFavorite 
        ? 'Usunięto z ulubionych' 
        : 'Dodano do ulubionych'
      );
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się zaktualizować ulubionych');
    }
  };
  
  // Resetowanie filtrów
  const resetFilters = () => {
    setSelectedSpecialties([]);
    setMinRating('0');
    setMinExperience('0');
    setSearchQuery('');
    
    // Aktualizacja wyszukiwania
    setTimeout(fetchAstrologers, 0);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Nagłówek strony */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mystical-glow">
          Nasi Astrologowie i Przewodnicy Duchowi
        </h1>
        <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
          Poznaj naszych doświadczonych astrologów i wybierz tego, który najlepiej spełni Twoje potrzeby duchowe.
        </p>
      </div>
      
      {/* Pasek wyszukiwania */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" size={18} />
          <Input
            placeholder="Szukaj astrologów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-indigo-950/40 border-indigo-400/30 text-white"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-1/3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-indigo-800/50 border-indigo-400/30 text-indigo-200"
          >
            <Filter size={16} className="mr-2" />
            Filtry
          </Button>
          
          <Button 
            onClick={handleFilterChange}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            Szukaj
          </Button>
        </div>
      </div>
      
      {/* Panel filtrów */}
      {showFilters && (
        <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Filtry wyszukiwania</h3>
            <Button
              variant="ghost"
              onClick={() => setShowFilters(false)}
              className="text-indigo-300 hover:bg-indigo-800/50"
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Specjalizacje */}
            <div>
              <h4 className="text-indigo-200 mb-2 font-medium">Specjalizacje</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {specialties.map((specialty) => (
                  <div key={specialty.id} className="flex items-center">
                    <Checkbox
                      id={`specialty-${specialty.id}`}
                      checked={selectedSpecialties.includes(specialty.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpecialties([...selectedSpecialties, specialty.id]);
                        } else {
                          setSelectedSpecialties(selectedSpecialties.filter(id => id !== specialty.id));
                        }
                      }}
                      className="border-indigo-400/50"
                    />
                    <Label
                      htmlFor={`specialty-${specialty.id}`}
                      className="ml-2 text-indigo-100 cursor-pointer"
                    >
                      {specialty.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ocena */}
            <div>
              <h4 className="text-indigo-200 mb-2 font-medium">Minimalna ocena</h4>
              <Select
                value={minRating}
                onValueChange={setMinRating}
              >
                <SelectTrigger className="bg-indigo-950/50 border-indigo-400/30 text-white">
                  <SelectValue placeholder="Wybierz ocenę" />
                </SelectTrigger>
                <SelectContent className="bg-indigo-900 border-indigo-400/30 text-white">
                  <SelectItem value="0">Wszystkie oceny</SelectItem>
                  <SelectItem value="3">3+ gwiazdki</SelectItem>
                  <SelectItem value="4">4+ gwiazdki</SelectItem>
                  <SelectItem value="4.5">4.5+ gwiazdki</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Doświadczenie */}
            <div>
              <h4 className="text-indigo-200 mb-2 font-medium">Lata doświadczenia</h4>
              <Select
                value={minExperience}
                onValueChange={setMinExperience}
              >
                <SelectTrigger className="bg-indigo-950/50 border-indigo-400/30 text-white">
                  <SelectValue placeholder="Wybierz doświadczenie" />
                </SelectTrigger>
                <SelectContent className="bg-indigo-900 border-indigo-400/30 text-white">
                  <SelectItem value="0">Dowolne doświadczenie</SelectItem>
                  <SelectItem value="1">Min. 1 rok</SelectItem>
                  <SelectItem value="3">Min. 3 lata</SelectItem>
                  <SelectItem value="5">Min. 5 lat</SelectItem>
                  <SelectItem value="10">Min. 10 lat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Przyciski filtrów */}
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="text-indigo-300 border-indigo-400/30 hover:bg-indigo-800/50"
            >
              Resetuj filtry
            </Button>
            <Button
              onClick={handleFilterChange}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              Zastosuj filtry
            </Button>
          </div>
        </div>
      )}
      
      {/* Lista astrologów */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-indigo-900/40 border-indigo-300/30 overflow-hidden">
              <div className="w-full h-48 bg-indigo-800/50">
                <Skeleton className="w-full h-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : astrologers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔮</div>
          <h3 className="text-xl font-semibold text-white mb-2">Brak wyników</h3>
          <p className="text-indigo-300">
            Nie znaleziono astrologów spełniających wybrane kryteria. Spróbuj zmienić filtry.
          </p>
          <Button 
            onClick={resetFilters} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-500"
          >
            Resetuj filtry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {astrologers.map((astrologer) => (
            <Card key={astrologer.id} className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all overflow-hidden">
              {/* Obrazek astrologa */}
              <div className="relative w-full h-48 overflow-hidden">
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
                
                {/* Odznaka wyróżnionego astrologa */}
                {astrologer.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500/90 text-black">
                    Wyróżniony
                  </Badge>
                )}
                
                {/* Przycisk ulubione */}
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    onClick={() => toggleFavorite(astrologer.id, !!astrologer.is_favorite)}
                  >
                    {astrologer.is_favorite ? (
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{astrologer.display_name}</CardTitle>
                <CardDescription className="text-indigo-200 flex items-center gap-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>
                      {astrologer.rating_average.toFixed(1)} ({astrologer.ratings_count})
                    </span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{astrologer.years_of_experience} lat doświadczenia</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Wyświetlenie specjalizacji */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(astrologer.astrologer_specialties || []).map((spec) => (
                    <Badge key={spec.id} variant="outline" className="bg-indigo-800/40 border-indigo-400/30">
                      {spec.specialty.name}
                    </Badge>
                  ))}
                </div>
                
                {/* Krótki opis */}
                <p className="text-indigo-100 text-sm line-clamp-3">
                  {astrologer.short_bio || ""}
                </p>
              </CardContent>
              
              <CardFooter>
                <Link href={`/astrologers/${astrologer.id}`} className="w-full">
                  <Button className="w-full bg-indigo-700 hover:bg-indigo-600">
                    Zobacz profil
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}