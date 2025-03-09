'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { RELATIONSHIP_STATUS_OPTIONS, type ZodiacSign } from '@/types/profile';
import { useUser } from '@/contexts/UserContext';

// Schemat walidacji formularza profilu (bez zmian)
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
  const { profile, updateProfile, loading: profileLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacSign[]>([]);

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
    }
  });

  // Aktualizacja wartości formularza gdy profile się zmieni
  useEffect(() => {
    if (profile) {
      // Resetujemy formularz z nowymi wartościami z profilu
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        birth_date: profile.birth_date || '',
        birth_time: profile.birth_time || '',
        birth_location: profile.birth_location || '',
        current_location: profile.current_location || '',
        relationship_status: profile.relationship_status || '',
      });
    }
  }, [profile, form]);

  // Pobranie znaków zodiaku przy pierwszym renderowaniu
  useEffect(() => {
    const fetchZodiacSigns = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error('Error fetching zodiac signs:', error);
        toast.error('Nie udało się pobrać znaków zodiaku');
      } finally {
        setLoading(false);
      }
    };
    
    fetchZodiacSigns();
  }, [supabase]);

  // Ograniczenie daty do 4 cyfr w roku
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateInput = e.target.value;
    if (dateInput.length > 10) {
      e.target.value = dateInput.slice(0, 10);
    }
  };

// Obsługa zapisu formularza
const onSubmit = async (values: ProfileFormValues) => {
  if (loading) return;
  
  setLoading(true);
  try {
    // Krok 1: Zapisanie profilu
    await updateProfile(values);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    toast.error('Wystąpił błąd podczas zapisywania profilu', {
      id: 'profile-error'
    });
  } finally {
    // Zawsze resetujemy stan ładowania po zakończeniu operacji
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/dashboard" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Twój profil astralny</h1>
      </div>

      <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-glow">
        <CardHeader>
          <CardTitle>Uzupełnij swój profil</CardTitle>
          <CardDescription className="text-indigo-200">
            Dzięki tym informacjom będziemy mogli przygotować dokładniejsze horoskopy i przepowiednie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(profileLoading) ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <fieldset disabled={loading} className="space-y-5">
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50 ${loading ? 'opacity-75' : ''}`}
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50 ${loading ? 'opacity-75' : ''}`} 
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white ${loading ? 'opacity-75' : ''}`} 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => {
                                  handleDateInput(e);
                                  field.onChange(e);
                                }}
                                max="9999-12-31" // Ograniczenie daty do 4-cyfrowego roku
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white ${loading ? 'opacity-75' : ''}`} 
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50 ${loading ? 'opacity-75' : ''}`} 
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
                                className={`bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50 ${loading ? 'opacity-75' : ''}`} 
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
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger className={`bg-indigo-950/50 border-indigo-300/30 text-white ${loading ? 'opacity-75' : ''}`}>
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
                </fieldset>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={`bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-glow w-full sm:w-auto transition-all ${loading ? 'opacity-90 pointer-events-none' : ''}`}
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
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}