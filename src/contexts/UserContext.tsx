'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Definiowanie interfejsów
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

export interface UserCredits {
  balance: number;
}

interface UserContextType {
  loading: boolean;
  profile: UserProfile | null;
  credits: UserCredits | null;
  userName: string;
  userInitials: string;
  userEmail: string;
  updateProfile: (newProfileData: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [userName, setUserName] = useState('Użytkownik');
  const [userInitials, setUserInitials] = useState('U');
  const [userEmail, setUserEmail] = useState('');

  // Funkcja do pobierania danych użytkownika
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

  // Funkcja do aktualizacji profilu użytkownika
  const updateProfile = async (newProfileData: Partial<UserProfile>) => {
    try {
      if (!profile?.id) {
        throw new Error('Brak ID profilu');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(newProfileData)
        .eq('id', profile.id);
        
      if (error) {
        throw error;
      }
      
      // Odświeżenie danych po aktualizacji
      await fetchUserData();
      
      toast.success('Profil został zaktualizowany');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Nie udało się zaktualizować profilu');
      throw error;
    }
  };

  // Pobranie danych przy pierwszym renderowaniu
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{
      loading,
      profile,
      credits,
      userName,
      userInitials,
      userEmail,
      updateProfile,
      refreshUserData: fetchUserData
    }}>
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