'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Save, 
  Loader2,
  User,
  CalendarIcon,
  Clock,
  MapPin,
  Heart,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { RELATIONSHIP_STATUS_OPTIONS } from '@/types/profile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, updateProfile, refreshUserData } = useUser();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    current_location: '',
    relationship_status: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Dodajemy key do wymuszenia pełnego przeładowania komponentu
  const [selectKey, setSelectKey] = useState(Date.now());

  // Aktualizuj formularz gdy dane profilu się zmienią
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        birth_date: profile.birth_date || '',
        birth_time: profile.birth_time || '',
        birth_location: profile.birth_location || '',
        current_location: profile.current_location || '',
        relationship_status: profile.relationship_status || '',
      });
      
      // Wymuszenie przeładowania komponentu Select
      setSelectKey(Date.now());
    }
  }, [profile]);

  // Obsługa zmiany pól formularza
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Obsługa zmiany dla pola select
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Obsługa zapisu formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('Brak danych profilu');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profil został zaktualizowany');
      
      // Odświeżamy komponent Select po zapisie
      setSelectKey(Date.now());
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Wystąpił błąd podczas zapisywania profilu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/dashboard" className="text-indigo-300 hover:text-indigo-200 mr-4">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Link>
        <h1 className="text-2xl font-bold text-white" data-testid="profile-title">Twój profil astralny</h1>
      </div>

      <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-glow">
        <CardHeader>
          <CardTitle>Uzupełnij swój profil</CardTitle>
          <CardDescription className="text-indigo-200">
            Dzięki tym informacjom będziemy mogli przygotować dokładniejsze horoskopy i przepowiednie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading.initial ? (
            <div className="flex justify-center py-8" data-testid="profile-loading-spinner">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
              <div className="grid gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Imię */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">
                      <User className="h-4 w-4 inline mr-2" />
                      Imię
                    </Label>
                    <Input 
                      data-testid="first-name-input"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swoje imię" 
                      className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50"
                    />
                  </div>
                  
                  {/* Nazwisko */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">Nazwisko</Label>
                    <Input 
                      data-testid="last-name-input"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swoje nazwisko" 
                      className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Data urodzenia */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      Data urodzenia
                    </Label>
                    <Input 
                      data-testid="birth-date-input"
                      name="birth_date"
                      type="date" 
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="bg-indigo-950/50 border-indigo-300/30 text-white"
                    />
                  </div>
                  
                  {/* Godzina urodzenia */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Godzina urodzenia
                    </Label>
                    <Input 
                      name="birth_time"
                      type="time" 
                      value={formData.birth_time}
                      onChange={handleInputChange}
                      className="bg-indigo-950/50 border-indigo-300/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Miejsce urodzenia */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Miejsce urodzenia
                    </Label>
                    <Input 
                      name="birth_location"
                      value={formData.birth_location}
                      onChange={handleInputChange}
                      placeholder="Miasto, kraj" 
                      className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50"
                    />
                  </div>
                  
                  {/* Obecna lokalizacja */}
                  <div className="space-y-2">
                    <Label className="text-indigo-100">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Obecna lokalizacja
                    </Label>
                    <Input 
                      name="current_location"
                      value={formData.current_location}
                      onChange={handleInputChange}
                      placeholder="Miasto, kraj" 
                      className="bg-indigo-950/50 border-indigo-300/30 text-white placeholder:text-indigo-400/50"
                    />
                  </div>
                </div>

                {/* Stan związku */}
                <div className="space-y-2">
                  <Label className="text-indigo-100">
                    <Heart className="h-4 w-4 inline mr-2" />
                    Stan związku
                  </Label>
                  
                  {/* Dodajemy key do komponentu Select, żeby wymusić jego przeładowanie */}
                  <Select
                    key={selectKey}
                    defaultValue={formData.relationship_status}
                    onValueChange={(value) => handleSelectChange('relationship_status', value)}
                  >
                    <SelectTrigger className="bg-indigo-950/50 border-indigo-300/30 text-white">
                      <SelectValue placeholder="Wybierz stan związku">
                        {/* Dodajemy jawne wyświetlanie aktualnie wybranej wartości */}
                        {formData.relationship_status ? 
                          RELATIONSHIP_STATUS_OPTIONS.find(option => option.value === formData.relationship_status)?.label || "Wybierz stan związku" 
                          : "Wybierz stan związku"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-indigo-900 border-indigo-300/30 text-white">
                      {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-indigo-800/30 p-4 rounded-lg border border-indigo-300/20">
                <p className="text-indigo-100 text-sm">
                  <span className="font-semibold">Dlaczego te informacje są ważne?</span> Każdy szczegół Twojego życia ma znaczenie w układaniu precyzyjnej mapy astralnej. Im więcej informacji nam udostępnisz, tym dokładniejsze będą Twoje horoskopy i przepowiednie. Twoje dane są bezpieczne i wykorzystywane wyłącznie do celów astrologicznych.
                </p>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaving || loading.profile}
                  data-testid="save-profile-button"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-glow"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" data-testid="saving-spinner" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}