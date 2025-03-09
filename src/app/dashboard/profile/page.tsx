'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  Loader2,
  CalendarIcon,
  Clock,
  MapPin,
  Heart,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RELATIONSHIP_STATUS_OPTIONS, type Profile, type ZodiacSign } from '@/types/profile';

// Schemat walidacji formularza profilu
const profileFormSchema = z.object({
  first_name: z.string().min(2, 'Imię musi mieć minimum 2 znaki').max(50, 'Imię może mieć maksymalnie 50 znaków').optional().nullable(),
  last_name: z.string().min(2, 'Nazwisko musi mieć minimum 2 znaki').max(50, 'Nazwisko może mieć maksymalnie 50 znaków').optional().nullable(),
  birth_date: z.string().optional().nullable(),
  birth_time: z.string().optional().nullable(),
  birth_location: z.string().max(255, 'Miejsce urodzenia może mieć maksymalnie 255 znaków').optional().nullable(),
  current_location: z.string().max(255, 'Obecna lokalizacja może mieć maksymalnie 255 znaków').optional().nullable(),
  relationship_status: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacSign[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Inicjalizacja formularza z react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birth_date: '',
      birth_time: '',
      birth_location: '',
      current_location: '',
      relationship_status: '',
    },
  });

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
          setUserId(userData.user.id);
          
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
            
            // Aktualizacja wartości formularza
            form.reset({
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              birth_date: profileData.birth_date || '',
              birth_time: profileData.birth_time || '',
              birth_location: profileData.birth_location || '',
              current_location: profileData.current_location || '',
              relationship_status: profileData.relationship_status || '',
            });
          }
          
          // Pobranie znaków zodiaku
          const { data: zodiacData, error: zodiacError } = await supabase
            .from('zodiac_signs')
            .select('*')
            .order('start_date');
            
          if (zodiacError) {
            throw zodiacError;
          }
          
          if (zodiacData) {
            setZodiacSigns(zodiacData);
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
  }, [supabase, form]);

  // Obsługa zapisu formularza
  const onSubmit = async (formData: ProfileFormValues) => {
    if (!userId) {
      toast.error('Nie można zapisać profilu - brak ID użytkownika');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          birth_date: formData.birth_date,
          birth_time: formData.birth_time,
          birth_location: formData.birth_location,
          current_location: formData.current_location,
          relationship_status: formData.relationship_status,
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      toast.success('Profil został zapisany pomyślnie');
      
      // Zaktualizuj lokalny stan profilu
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (newProfile) {
        setProfile(newProfile);
      }
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Błąd podczas zapisywania profilu', {
        description: error.message || 'Wystąpił nieoczekiwany błąd'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-950/20 to-indigo-900/10">
      <header className="bg-indigo-900/70 backdrop-blur-sm shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-white hover:bg-indigo-800/50 mr-2"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Powrót
              </Button>
              <h1 className="text-xl text-white text-light">Twój Profil Astralny</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-light mystical-glow">Uzupełnij swój profil astralny</CardTitle>
              <CardDescription className="text-indigo-200">
                Podaj swoje dane, aby otrzymać spersonalizowany horoskop dopasowany do Twojej energii astralnej
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Imię */}
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">
                              <User className="h-4 w-4 inline mr-2" />
                              Imię
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Wprowadź swoje imię" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Twoje imię używane w horoskopach
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Nazwisko */}
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">Nazwisko</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Wprowadź swoje nazwisko" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Opcjonalne, tylko do naszej wiadomości
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Data urodzenia */}
                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">
                              <CalendarIcon className="h-4 w-4 inline mr-2" />
                              Data urodzenia
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Niezbędne do obliczenia Twojego znaku zodiaku
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Godzina urodzenia */}
                      <FormField
                        control={form.control}
                        name="birth_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Godzina urodzenia
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Pomaga określić Twój ascendent
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Miejsce urodzenia */}
                      <FormField
                        control={form.control}
                        name="birth_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">
                              <MapPin className="h-4 w-4 inline mr-2" />
                              Miejsce urodzenia
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Miasto, kraj" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Wpływa na dokładność Twojego horoskopu
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Obecna lokalizacja */}
                      <FormField
                        control={form.control}
                        name="current_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-100">
                              <MapPin className="h-4 w-4 inline mr-2" />
                              Obecna lokalizacja
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Miasto, kraj" 
                                className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-indigo-300/70">
                              Pomaga w dostosowaniu przepowiedni do Twojego obecnego położenia
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Stan związku */}
                    <FormField
                      control={form.control}
                      name="relationship_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-indigo-100">
                            <Heart className="h-4 w-4 inline mr-2" />
                            Stan związku
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-indigo-950/50 border-indigo-300/30 text-white">
                                <SelectValue placeholder="Wybierz stan związku" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-indigo-900 border-indigo-300/30 text-white">
                              {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-indigo-300/70">
                            Pomaga w tworzeniu horoskopów dotyczących relacji
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-indigo-800/30 p-4 rounded-lg border border-indigo-300/20">
                    <p className="text-indigo-100 text-sm">
                      <span className="font-semibold">Dlaczego te informacje są ważne?</span> Każdy szczegół Twojego życia ma znaczenie w układaniu precyzyjnej mapy astralnej. Im więcej informacji nam udostępnisz, tym dokładniejsze będą Twoje horoskopy i przepowiednie. Twoje dane są bezpieczne i wykorzystywane wyłącznie do celów astrologicznych.
                    </p>
                  </div>
                
                  <CardFooter className="flex justify-between px-0 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/dashboard')}
                      className="border-indigo-300/30 text-white hover:bg-indigo-800/60"
                    >
                      Anuluj
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-glow"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Zapisz profil
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
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