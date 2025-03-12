'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  Heart, 
  Calendar, 
  Clock, 
  Award, 
  User,
  MessageCircle,
  ChevronLeft,
  Globe,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import type { AstrologerWithDetails } from '@/types/astrologer';
import { Skeleton } from '@/components/ui/skeleton';

// Helper do formatowania dni tygodnia
const formatDayOfWeek = (day: number): string => {
  const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  return days[day];
};

// Helper do formatowania godzin
const formatTime = (time: string): string => {
  return time.substring(0, 5); // Format "HH:MM" z "HH:MM:SS"
};

export default function AstrologerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userEmail, profile } = useUser();
  const isLoggedIn = !!userEmail;
  
  const [astrologer, setAstrologer] = useState<AstrologerWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Stan dla recenzji
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  // Pobranie danych astrologa
  useEffect(() => {
    const fetchAstrologerDetails = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/astrologers/${params.id}`);
        if (!response.ok) throw new Error('Błąd pobierania danych astrologa');
        
        const data = await response.json();
        setAstrologer(data);
        setIsFavorite(!!data.is_favorite);
      } catch (error) {
        console.error('Błąd:', error);
        toast.error('Nie udało się pobrać danych astrologa');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAstrologerDetails();
  }, [params.id]);
  
  // Funkcja do obsługi dodawania/usuwania ulubionych
  const toggleFavorite = async () => {
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
          astrologerId: params.id,
          action: isFavorite ? 'remove' : 'add',
        }),
      });
      
      if (!response.ok) throw new Error('Błąd aktualizacji ulubionych');
      
      // Aktualizacja stanu lokalnie
      setIsFavorite(!isFavorite);
      
      toast.success(isFavorite 
        ? 'Usunięto z ulubionych' 
        : 'Dodano do ulubionych'
      );
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się zaktualizować ulubionych');
    }
  };
  
  // Wysłanie recenzji
  const submitReview = async () => {
    if (!isLoggedIn) {
      toast.error('Musisz być zalogowany, aby dodać recenzję');
      return;
    }
    
    setSubmitReviewLoading(true);
    
    try {
      const response = await fetch(`/api/astrologers/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      
      if (!response.ok) throw new Error('Błąd dodawania recenzji');
      
      toast.success('Recenzja dodana pomyślnie');
      setReviewDialogOpen(false);
      
      // Odświeżenie danych astrologa, aby zobaczyć nową recenzję
      const astrologerResponse = await fetch(`/api/astrologers/${params.id}`);
      if (astrologerResponse.ok) {
        const updatedData = await astrologerResponse.json();
        setAstrologer(updatedData);
      }
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się dodać recenzji');
    } finally {
      setSubmitReviewLoading(false);
    }
  };
  
  // Funkcja do zamówienia konsultacji
  const bookConsultation = () => {
    if (!isLoggedIn) {
      toast.error('Musisz być zalogowany, aby zamówić konsultację');
      return;
    }
    
    // Tutaj przekierowanie do strony zamówień lub otwarcie modalu
    router.push(`/dashboard/consultations/new?astrologer=${params.id}`);
  };
  
  // Komponent renderujący gwiazdki dla ocen
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };
  
  // Komponent gwiazdk-selektor dla recenzji
  const StarSelector = () => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= reviewRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-indigo-900/40 border-indigo-300/30 rounded-lg overflow-hidden">
              <Skeleton className="w-full h-64" />
              <div className="p-6">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/3 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-indigo-900/40 border-indigo-300/30 rounded-lg p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!astrologer) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="text-5xl mb-4">🔮</div>
        <h2 className="text-2xl font-semibold text-white mb-4">Astrolog nie został znaleziony</h2>
        <p className="text-indigo-200 mb-6">Przepraszamy, nie mogliśmy znaleźć astrologa o podanym identyfikatorze.</p>
        <Button 
          onClick={() => router.push('/astrologers')}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do listy astrologów
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Przycisk powrotu */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/astrologers')}
          className="text-indigo-300 hover:text-indigo-100 flex items-center"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Wróć do listy astrologów
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Główna sekcja z informacjami */}
        <div className="md:col-span-2">
          {/* Zdjęcie i podstawowe informacje */}
          <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg mb-8 overflow-hidden">
            {/* Zdjęcie w tle */}
            <div className="relative w-full h-64">
              {astrologer.cover_image_url ? (
                <Image
                  src={astrologer.cover_image_url}
                  alt={astrologer.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-800/50 flex items-center justify-center">
                  <div className="text-6xl">✨</div>
                </div>
              )}
              
              {/* Zdjęcie profilowe */}
              <div className="absolute left-6 -bottom-16 w-32 h-32 rounded-full border-4 border-indigo-900/40 overflow-hidden bg-indigo-800">
                {astrologer.profile_image_url ? (
                  <Image
                    src={astrologer.profile_image_url}
                    alt={astrologer.display_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🔮</span>
                  </div>
                )}
              </div>
              
              {/* Przycisk ulubione */}
              {isLoggedIn && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  className={`absolute top-4 right-4 ${
                    isFavorite 
                      ? "bg-indigo-600 hover:bg-indigo-500" 
                      : "bg-black/30 border-white/30 hover:bg-black/50"
                  }`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-white" : ""}`} />
                  {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
                </Button>
              )}
            </div>
            
            {/* Dane astrologa */}
            <div className="p-6 pt-20">
              {/* Imię i ocena */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{astrologer.display_name}</h1>
                  <div className="flex items-center mt-1">
                    <StarRating rating={astrologer.rating_average} />
                    <span className="ml-2 text-indigo-200">
                      {astrologer.rating_average.toFixed(1)} ({astrologer.ratings_count} {astrologer.ratings_count === 1 ? 'opinia' : 'opinii'})
                    </span>
                  </div>
                </div>
                
                {/* Specjalizacje */}
                <div className="mt-4 sm:mt-0">
                  <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    {astrologer.specialties?.map(spec => (
                      <Badge 
                        key={spec.id} 
                        className="bg-indigo-800/60 text-indigo-100"
                      >
                        {spec.specialty.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Krótkie dane */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-indigo-200">
                {astrologer.years_of_experience && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-indigo-300" />
                    {astrologer.years_of_experience} lat doświadczenia
                  </div>
                )}
                {astrologer.languages && astrologer.languages.length > 0 && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-indigo-300" />
                    {astrologer.languages.join(', ')}
                  </div>
                )}
                {astrologer.consultation_price && (
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1 text-indigo-300" />
                    {astrologer.consultation_price} zł/h konsultacji
                  </div>
                )}
              </div>
              
              {/* Tabs z treścią */}
              <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-indigo-800/50 border-indigo-300/30">
                  <TabsTrigger value="about" className="data-[state=active]:bg-indigo-700/70">O mnie</TabsTrigger>
                  <TabsTrigger value="specialties" className="data-[state=active]:bg-indigo-700/70">Specjalizacje</TabsTrigger>
                  <TabsTrigger value="credentials" className="data-[state=active]:bg-indigo-700/70">Certyfikaty</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-indigo-700/70">Opinie</TabsTrigger>
                </TabsList>
                
                {/* O mnie */}
                <TabsContent value="about" className="pt-4">
                  <div className="prose prose-invert prose-indigo max-w-none">
                    <p className="text-indigo-100">
                      {astrologer.full_bio || astrologer.short_bio || "Brak szczegółowego opisu."}
                    </p>
                  </div>
                </TabsContent>
                
                {/* Specjalizacje */}
                <TabsContent value="specialties" className="pt-4">
                  <div className="grid gap-4">
                    {astrologer.specialties?.length ? (
                      astrologer.specialties.map(spec => (
                        <div key={spec.id} className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-700/30">
                          <h3 className="text-lg font-medium text-indigo-100 mb-1">{spec.specialty.name}</h3>
                          {spec.years_experience && (
                            <div className="text-sm text-indigo-300 mb-2">
                              {spec.years_experience} lat doświadczenia
                            </div>
                          )}
                          <p className="text-indigo-200 text-sm">
                            {spec.description || spec.specialty.description || "Brak szczegółowego opisu."}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-indigo-300">Brak informacji o specjalizacjach.</p>
                    )}
                  </div>
                </TabsContent>
                
                {/* Certyfikaty */}
                <TabsContent value="credentials" className="pt-4">
                  <div className="grid gap-4">
                    {astrologer.credentials?.length ? (
                      astrologer.credentials.map(credential => (
                        <div key={credential.id} className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-700/30">
                          <h3 className="text-lg font-medium text-indigo-100 mb-1">{credential.title}</h3>
                          <div className="text-sm text-indigo-300 mb-2">
                            {credential.issuer}
                            {credential.issue_date && ` • ${new Date(credential.issue_date).getFullYear()}`}
                          </div>
                          {credential.description && (
                            <p className="text-indigo-200 text-sm">{credential.description}</p>
                          )}
                          {credential.credential_url && (
                            <a 
                              href={credential.credential_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
                            >
                              Zobacz certyfikat →
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-indigo-300">Brak informacji o certyfikatach.</p>
                    )}
                  </div>
                </TabsContent>
                
                {/* Opinie */}
                <TabsContent value="reviews" className="pt-4">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                      Opinie klientów ({astrologer.ratings_count})
                    </h3>
                    
                    {isLoggedIn && (
                      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-indigo-600 hover:bg-indigo-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Dodaj opinię
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-indigo-900 border-indigo-300/30 text-white">
                          <DialogHeader>
                            <DialogTitle>Dodaj swoją opinię</DialogTitle>
                            <DialogDescription className="text-indigo-300">
                              Podziel się swoim doświadczeniem współpracy z {astrologer.display_name}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="flex flex-col space-y-2">
                              <label className="text-indigo-200 text-sm">Twoja ocena</label>
                              <StarSelector />
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <label className="text-indigo-200 text-sm">Twój komentarz</label>
                              <Textarea 
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Opisz swoje doświadczenie..."
                                className="min-h-[100px] bg-indigo-950/50 border-indigo-400/30 text-white"
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              className="border-indigo-400/30 text-indigo-200"
                              onClick={() => setReviewDialogOpen(false)}
                            >
                              Anuluj
                            </Button>
                            <Button 
                              onClick={submitReview}
                              disabled={submitReviewLoading}
                              className="bg-indigo-600 hover:bg-indigo-500"
                            >
                              {submitReviewLoading ? 'Wysyłanie...' : 'Wyślij opinię'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {astrologer.reviews?.length ? (
                    <div className="space-y-4">
                      {astrologer.reviews.map(review => (
                        <div key={review.id} className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-700/30">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-indigo-100 font-medium">
                                  {review.user_profile?.first_name || 'Użytkownik'} {review.user_profile?.last_name?.charAt(0) || ''}
                                </p>
                                <p className="text-xs text-indigo-300">
                                  {new Date(review.created_at).toLocaleDateString('pl-PL')}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                          {review.comment && (
                            <p className="text-indigo-200 text-sm">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-indigo-800/20 rounded-lg">
                      <p className="text-indigo-300 mb-2">Ten astrolog nie ma jeszcze opinii.</p>
                      {isLoggedIn && (
                        <Button 
                          onClick={() => setReviewDialogOpen(true)}
                          className="bg-indigo-600 hover:bg-indigo-500"
                        >
                          Bądź pierwszy, który doda opinię
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
        
        {/* Boczna sekcja z dostępnością i możliwością zamówienia */}
        <div>
          {/* Karta dostępności i umówienia się */}
          <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Umów konsultację</CardTitle>
              <CardDescription className="text-indigo-200">
                Skonsultuj swoją mapę astralną z {astrologer.display_name}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {astrologer.consultation_price ? (
                <div className="bg-indigo-800/30 p-4 rounded-lg mb-4 border border-indigo-700/30">
                  <p className="text-lg font-semibold text-indigo-100 mb-1">
                    {astrologer.consultation_price} zł / godzina
                  </p>
                  <p className="text-sm text-indigo-300">
                    Twoja konsultacja zostanie potwierdzona w ciągu 24 godzin
                  </p>
                </div>
              ) : (
                <div className="bg-indigo-800/30 p-4 rounded-lg mb-4 border border-indigo-700/30">
                  <p className="text-indigo-200">
                    Skontaktuj się, aby ustalić cenę konsultacji
                  </p>
                </div>
              )}
              
              {astrologer.availability?.length ? (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white mb-2">Dostępność:</h3>
                  <div className="space-y-2">
                    {astrologer.availability.map(slot => (
                      <div key={slot.id} className="bg-indigo-800/20 rounded p-2 flex justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-indigo-300" />
                          <span>{formatDayOfWeek(slot.day_of_week)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-indigo-300" />
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-indigo-300 text-sm mb-4">
                  Brak informacji o dostępności. Skontaktuj się bezpośrednio.
                </p>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                onClick={bookConsultation}
                disabled={!astrologer.is_available}
              >
                {astrologer.is_available 
                  ? 'Zarezerwuj konsultację' 
                  : 'Astrolog obecnie niedostępny'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Języki */}
          {astrologer.languages && astrologer.languages.length > 0 && (
            <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm">Języki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {astrologer.languages.map(language => (
                    <Badge key={language} variant="outline" className="bg-indigo-800/30">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}