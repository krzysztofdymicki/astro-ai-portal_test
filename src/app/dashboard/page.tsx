'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Star, 
  Edit, 
  FileQuestion, 
  Moon,
  Sun,
  BarChart
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Definiowanie interfejsu dla danych profilu użytkownika
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  current_location: string | null;
  relationship_status: string | null;
  zodiac_sign_id: string | null;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

// Interfejs dla danych kredytów użytkownika
interface UserCredits {
  balance: number;
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [userName, setUserName] = useState('Użytkownik');
  const [userInitials, setUserInitials] = useState('U');
  const [userEmail, setUserEmail] = useState('');

  // Pobranie danych użytkownika i profilu przy pierwszym renderowaniu
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Pobranie danych użytkownika
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (userData?.user) {
          setUserEmail(userData.user.email || '');
          
          // Pobranie profilu użytkownika
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 oznacza "nie znaleziono", co jest OK, jeśli profil jeszcze nie istnieje
            throw profileError;
          }
          
          if (profileData) {
            setProfile(profileData);
            
            // Ustawienie imienia i inicjałów użytkownika
            if (profileData.first_name) {
              setUserName(profileData.first_name);
              
              let initials = profileData.first_name.charAt(0).toUpperCase();
              if (profileData.last_name) {
                initials += profileData.last_name.charAt(0).toUpperCase();
              }
              setUserInitials(initials);
            }
          }
          
          // Pobranie kredytów użytkownika
          const { data: creditsData, error: creditsError } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userData.user.id)
            .single();
            
          if (creditsError && creditsError.code !== 'PGRST116') {
            throw creditsError;
          }
          
          if (creditsData) {
            setCredits(creditsData);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Nie udało się pobrać danych użytkownika');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase]);

  // Obsługa wylogowania
  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Błąd wylogowania", {
          description: error.message
        });
      } else {
        toast.success("Wylogowano pomyślnie");
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header z menu użytkownika */}
      <header className="bg-indigo-900/70 backdrop-blur-sm shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl text-white text-light mystical-glow">Twoja Przepowiednia</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Dropdown menu użytkownika */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full border border-indigo-300/50 bg-indigo-800/40 hover:bg-indigo-800/60"
                    data-testid="user-avatar-button"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/api/avatar" alt={userName} />
                      <AvatarFallback className="bg-indigo-600 text-white">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-1 border-indigo-300/50 bg-indigo-900/95 text-white backdrop-blur-sm" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-indigo-300">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-indigo-700/50" />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                    <CreditCard className="h-4 w-4 text-indigo-300" />
                    <span>Kredyty:</span>
                    <span className="ml-auto font-bold">{credits?.balance || 0}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-indigo-700/50" />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80" asChild>
                    <Link href="/dashboard/profile">
                      <User className="h-4 w-4 text-indigo-300" />
                      <span>Mój profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                    <Settings className="h-4 w-4 text-indigo-300" />
                    <span>Ustawienia</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                    <HelpCircle className="h-4 w-4 text-indigo-300" />
                    <span>Pomoc</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-indigo-700/50" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-300 hover:bg-red-900/30 hover:text-red-200"
                    onClick={handleSignOut}
                    disabled={loading}
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{loading ? "Wylogowywanie..." : "Wyloguj się"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="flex-grow p-4 sm:p-6 bg-gradient-to-b from-indigo-950/20 to-indigo-900/10">
        <div className="max-w-7xl mx-auto">
          {/* Powitanie i statystyki profilu */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mystical-glow mb-2">
              Witaj, {profile?.first_name || 'Wędrowcze Gwiazd'}
            </h1>
            <p className="text-indigo-200 text-light">
              Twoja podróż przez konstelacje dopiero się zaczyna. Odkryj swoje przeznaczenie zapisane w gwiazdach.
            </p>

            {/* Pasek postępu uzupełnienia profilu */}
            <div className="mt-6 p-4 backdrop-blur-sm border border-indigo-300/20 rounded-lg bg-indigo-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h3 className="text-white text-sm font-medium">Uzupełnienie profilu astralnego</h3>
                <span className="text-indigo-200 text-sm">
                  {profile?.profile_completion_percentage || 0}% ukończono
                </span>
              </div>
              <Progress value={profile?.profile_completion_percentage || 0} className="h-2" />
              
              <div className="mt-4 text-xs text-indigo-300">
                <p>Uzupełnij swój profil astralny, aby otrzymać bardziej precyzyjne przepowiednie.</p>
              </div>
            </div>
          </div>

          {/* Główne kafelki nawigacyjne */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kafelek profilu */}
            <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-glow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-300" />
                  Twój Profil Astralny
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  Uzupełnij dane potrzebne do precyzyjnych horoskopów
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Data urodzenia:</span>
                    <span>{profile?.birth_date || 'Nie określono'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Godzina urodzenia:</span>
                    <span>{profile?.birth_time || 'Nie określono'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Miejsce urodzenia:</span>
                    <span>{profile?.birth_location || 'Nie określono'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Znak zodiaku:</span>
                    <span className="font-medium">{profile?.zodiac_sign_id ? 'Do ustalenia' : 'Nie określono'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-indigo-600/90 hover:bg-indigo-600 text-white border-none" asChild>
                  <Link href="/dashboard/profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Uzupełnij profil
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Kafelek dodatkowych pytań */}
            <Card className="bg-indigo-900/40 border-indigo-300/30 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-indigo-300" />
                  Pytania Dodatkowe
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  Odpowiedz i zdobądź kredyty na ekskluzywne przepowiednie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Dostępne pytania:</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Możliwe do zdobycia kredyty:</span>
                    <span className="font-medium">25</span>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-800/30 rounded border border-indigo-300/20">
                    <p className="text-indigo-100 text-xs italic">
                      "Szczegółowe odpowiedzi pomagają nam lepiej zrozumieć Twoją ścieżkę życiową i przygotować precyzyjniejsze horoskopy."
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-indigo-700/90 hover:bg-indigo-700 text-white border-none shadow-glow" asChild>
                  <Link href="/dashboard/questions">
                    <Star className="h-4 w-4 mr-2" />
                    Odpowiedz na pytania
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Kafelek horoskopów */}
            <Card className="bg-indigo-900/40 border-indigo-300/30 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-300" />
                  Twoje Horoskopy
                </CardTitle>
                <CardDescription className="text-indigo-200">
                  Sprawdź swoje aktualne i archiwalne przepowiednie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded border border-indigo-300/20">
                    <span className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-yellow-200" />
                      Dzienny
                    </span>
                    <span className="text-indigo-200 text-xs">Dostępny</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded border border-indigo-300/20">
                    <span className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-blue-300" />
                      Miesięczny
                    </span>
                    <span className="text-indigo-200 text-xs">5 kredytów</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded border border-indigo-300/20">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-purple-300" />
                      Osobisty
                    </span>
                    <span className="text-indigo-200 text-xs">15 kredytów</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-indigo-700/90 hover:bg-indigo-700 text-white border-none" asChild>
                  <Link href="/dashboard/horoscopes">
                    <Moon className="h-4 w-4 mr-2" />
                    Przeglądaj horoskopy
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Cytat motywacyjny */}
          <div className="mt-10 text-center">
            <p className="text-indigo-200 italic text-light">
              "Gwiazdy nie determinują Twojego przeznaczenia. One jedynie oświetlają ścieżkę, którą możesz podążać."
            </p>
            <p className="text-indigo-300 text-sm mt-1">― Starożytna mądrość astrologiczna</p>
          </div>
        </div>
      </main>

      {/* Stopka */}
      <footer className="relative z-10 mt-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,5,25,0.3)] to-[rgba(10,5,25,0.6)] backdrop-blur-[2px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-200/70 text-light">
            &copy; {new Date().getFullYear()} Twoja Przepowiednia. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}