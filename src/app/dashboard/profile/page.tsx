'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Loader2,
  User,
  CalendarIcon,
  Clock,
  MapPin,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
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
import { FormInput } from '@/components/ui/FormInput';
import { BasicForm } from '@/components/ui/BasicForm';

export default function ProfilePage() {
  const { profile, loading, updateProfile, zodiacSign } = useUser();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    current_location: '',
    relationship_status: '',
    zodiac_sign: '',
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
        zodiac_sign: profile.zodiac_sign || '', 
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
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center mb-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-indigo-200 mr-4">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Powrót</span>
          </Link>
          <h1 className="text-2xl font-bold text-white" data-testid="profile-title">Twój profil astralny</h1>
        </div>

        <div className="space-y-6">
          {loading.initial ? (
            <div className="flex justify-center py-8" data-testid="profile-loading-spinner">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            /* Półprzezroczysty kontener dla formularza */
            <div className="mt-8 card-mystical p-6 sm:p-8">
              <div className="space-y-2 mb-6">
                <h3 className="text-xl text-light text-center">Uzupełnij swój profil</h3>
                <p className="text-gray-600 text-center text-sm text-light">
                  Dzięki tym informacjom będziemy mogli przygotować dokładniejsze horoskopy i przepowiednie.
                </p>
              </div>
              
              <BasicForm
                onSubmit={handleSubmit}
                submitText="Zapisz profil"
                isLoading={isSaving}
                className="space-y-6"
                ariaLabel="Formularz profilu"
              >
                <div className="grid gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Imię */}
                    <FormInput
                      id="first_name"
                      label={<><User className="h-4 w-4 inline mr-2" />Imię</>}
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swoje imię"
                      testId="first-name-input"
                    />
                    
                    {/* Nazwisko */}
                    <FormInput
                      id="last_name"
                      label="Nazwisko"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Wprowadź swoje nazwisko"
                      testId="last-name-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Data urodzenia */}
                    <div className="space-y-2">
                      <FormInput
                        id="birth_date"
                        label={<><CalendarIcon className="h-4 w-4 inline mr-2" />Data urodzenia</>}
                        type="date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        testId="birth-date-input"
                      />
                      {zodiacSign && (
                        <div className="flex items-center mt-1 text-xs text-muted bg-accent/40 p-1 px-2 rounded border border-accent/20">
                          <span className="mr-1">{zodiacSign.symbol}</span>
                          <span>Twój znak zodiaku: {zodiacSign.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Godzina urodzenia */}
                    <FormInput
                      id="birth_time"
                      label={<><Clock className="h-4 w-4 inline mr-2" />Godzina urodzenia</>}
                      type="time"
                      value={formData.birth_time}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Miejsce urodzenia */}
                    <FormInput
                      id="birth_location"
                      label={<><MapPin className="h-4 w-4 inline mr-2" />Miejsce urodzenia</>}
                      value={formData.birth_location}
                      onChange={handleInputChange}
                      placeholder="Miasto, kraj"
                    />
                    
                    {/* Obecna lokalizacja */}
                    <FormInput
                      id="current_location"
                      label={<><MapPin className="h-4 w-4 inline mr-2" />Obecna lokalizacja</>}
                      value={formData.current_location}
                      onChange={handleInputChange}
                      placeholder="Miasto, kraj"
                    />
                  </div>

                  {/* Stan związku */}
                  <div className="space-y-2">
                    <Label>
                      <Heart className="h-4 w-4 inline mr-2" />
                      Stan związku
                    </Label>
                    
                    {/* Dodajemy key do komponentu Select, żeby wymusić jego przeładowanie */}
                    <Select
                      key={selectKey}
                      defaultValue={formData.relationship_status}
                      onValueChange={(value) => handleSelectChange('relationship_status', value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-input text-foreground">
                        <SelectValue placeholder="Wybierz stan związku">
                          {formData.relationship_status ? 
                            RELATIONSHIP_STATUS_OPTIONS.find(option => option.value === formData.relationship_status)?.label || "Wybierz stan związku" 
                            : "Wybierz stan związku"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border border-input">
                        {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-indigo-50/80 rounded-lg p-4 border border-subtle">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Dlaczego te informacje są ważne?</span> Każdy szczegół Twojego życia ma znaczenie w układaniu precyzyjnej mapy astralnej. Im więcej informacji nam udostępnisz, tym dokładniejsze będą Twoje horoskopy i przepowiednie. Twoje dane są bezpieczne i wykorzystywane wyłącznie do celów astrologicznych.
                  </p>
                </div>
              </BasicForm>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}