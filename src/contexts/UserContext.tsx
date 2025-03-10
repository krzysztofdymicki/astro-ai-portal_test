'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Definicja interfejsu profilu
export interface UserProfile {
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

// Dodajemy interfejs dla kredytów
export interface UserCredits {
  balance: number;
  last_updated?: string;
}

// Prosty interfejs stanu ładowania
interface LoadingState {
  initial: boolean;
  profile: boolean;
}

// Definicja kontekstu użytkownika - z dodanymi kredytami
interface UserContextType {
  // Dane użytkownika
  profile: UserProfile | null;
  userEmail: string;
  userName: string;
  userInitials: string;
  credits: UserCredits | null;
  
  // Stan ładowania
  loading: LoadingState;
  
  // Funkcje
  updateProfile: (newProfileData: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Utworzenie kontekstu
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider kontekstu
export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  
  // Stan ładowania
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    profile: false
  });
  
  // Dane podstawowe
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Użytkownik');
  const [userInitials, setUserInitials] = useState('U');
  const [credits, setCredits] = useState<UserCredits | null>(null);

  // Funkcja do pobierania danych użytkownika
  const fetchUserData = async () => {
    setLoading(prev => ({ ...prev, initial: true }));
    try {
      // Pobranie danych użytkownika z auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!userData?.user) {
        throw new Error('Brak zalogowanego użytkownika');
      }
      
      const userId = userData.user.id;
      setUserEmail(userData.user.email || '');
      
      // Pobranie profilu użytkownika
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profileData) {
        setProfile(profileData);
        
        // Aktualizacja pochodnych danych
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
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (creditsError && creditsError.code !== 'PGRST116') {
        throw creditsError;
      }
      
      if (creditsData) {
        setCredits(creditsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Nie udało się pobrać danych użytkownika');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  // Funkcja do aktualizacji profilu
  const updateProfile = async (newProfileData: Partial<UserProfile>) => {
    try {
      if (!profile?.id) {
        throw new Error('Brak ID profilu');
      }
      
      setLoading(prev => ({ ...prev, profile: true }));
      
      // Aktualizacja danych w bazie
      const { data, error } = await supabase
        .from('profiles')
        .update(newProfileData)
        .eq('id', profile.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Aktualizacja lokalnego stanu
      if (data) {
        setProfile(data);
        
        // Aktualizacja pochodnych danych
        if (data.first_name) {
          setUserName(data.first_name);
          
          let initials = data.first_name.charAt(0).toUpperCase();
          if (data.last_name) {
            initials += data.last_name.charAt(0).toUpperCase();
          }
          setUserInitials(initials);
        }
      }
      
      toast.success('Profil został zaktualizowany');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Nie udało się zaktualizować profilu');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Pobranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchUserData();
  }, []);

  // Kontekst dostępny dla komponentów
  const contextValue = {
    profile,
    userEmail,
    userName,
    userInitials,
    credits,
    loading,
    updateProfile,
    refreshUserData: fetchUserData
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Hook dla łatwego dostępu do kontekstu
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}