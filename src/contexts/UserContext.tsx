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

// Interfejs dla pytań profilowych
export interface ProfileQuestion {
  id: string;
  question: string;
  credits_reward: number;
  is_active: boolean;
}

// Interfejs dla odpowiedzi użytkownika
export interface ProfileAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string | null;
  answered_at: string;
}

// Prosty interfejs stanu ładowania
interface LoadingState {
  initial: boolean;
  profile: boolean;
  questions: boolean;
  answers: boolean;
  submitting: boolean;
}

// Definicja kontekstu użytkownika - z dodanymi kredytami
interface UserContextType {
  // Dane użytkownika
  profile: UserProfile | null;
  userEmail: string;
  userName: string;
  userInitials: string;
  credits: UserCredits | null;
  
  // Pytania i odpowiedzi
  profileQuestions: ProfileQuestion[];
  profileAnswers: ProfileAnswer[];
  
  // Stan ładowania
  loading: LoadingState;
  
  // Funkcje
  updateProfile: (newProfileData: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  submitProfileAnswer: (questionId: string, answer: string) => Promise<boolean>;
  isQuestionAnswered: (questionId: string) => boolean;
  getQuestionAnswer: (questionId: string) => string | null;
}

// Utworzenie kontekstu
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider kontekstu
export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  
  // Stan ładowania
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    profile: false,
    questions: false,
    answers: false,
    submitting: false
  });
  
  // Dane podstawowe
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Użytkownik');
  const [userInitials, setUserInitials] = useState('U');
  const [credits, setCredits] = useState<UserCredits | null>(null);
  
  // Pytania i odpowiedzi
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>([]);
  const [profileAnswers, setProfileAnswers] = useState<ProfileAnswer[]>([]);

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
      
      // Pobranie pytań profilowych
      await fetchProfileQuestions();
      
      // Pobranie odpowiedzi użytkownika
      await fetchUserAnswers(userId);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Nie udało się pobrać danych użytkownika');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };
  
  // Pobranie pytań profilowych
  const fetchProfileQuestions = async () => {
    setLoading(prev => ({ ...prev, questions: true }));
    try {
      const { data, error } = await supabase
        .from('profile_questions')
        .select('*')
        .eq('is_active', true)
        .order('id');
        
      if (error) throw error;
      
      if (data) {
        setProfileQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching profile questions:', error);
      toast.error('Nie udało się pobrać dodatkowych pytań');
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };
  
  // Pobranie odpowiedzi użytkownika
  const fetchUserAnswers = async (userId: string) => {
    setLoading(prev => ({ ...prev, answers: true }));
    try {
      const { data, error } = await supabase
        .from('profile_answers')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data) {
        setProfileAnswers(data);
      }
    } catch (error) {
      console.error('Error fetching user answers:', error);
      toast.error('Nie udało się pobrać odpowiedzi na pytania');
    } finally {
      setLoading(prev => ({ ...prev, answers: false }));
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
  
  // Sprawdzenie czy na pytanie już odpowiedziano
  const isQuestionAnswered = (questionId: string): boolean => {
    return profileAnswers.some(answer => answer.question_id === questionId);
  };
  
  // Pobranie odpowiedzi na pytanie
  const getQuestionAnswer = (questionId: string): string | null => {
    const answer = profileAnswers.find(a => a.question_id === questionId);
    return answer ? answer.answer : null;
  };
  
  // Dodanie odpowiedzi na pytanie profilowe
  const submitProfileAnswer = async (questionId: string, answer: string): Promise<boolean> => {
    if (!profile?.id) {
      toast.error('Brak ID profilu');
      return false;
    }
    
    if (!answer.trim()) {
      toast.error('Odpowiedź nie może być pusta');
      return false;
    }
    
    setLoading(prev => ({ ...prev, submitting: true }));
    
    try {
      // Sprawdzenie, czy pytanie istnieje
      const question = profileQuestions.find(q => q.id === questionId);
      if (!question) {
        throw new Error('Pytanie nie istnieje');
      }
      
      // Sprawdzenie, czy na pytanie już odpowiedziano
      if (isQuestionAnswered(questionId)) {
        // Aktualizacja istniejącej odpowiedzi
        const existingAnswer = profileAnswers.find(a => a.question_id === questionId);
        
        if (existingAnswer) {
          const { data, error } = await supabase
            .from('profile_answers')
            .update({ answer: answer.trim() })
            .eq('id', existingAnswer.id)
            .select()
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Aktualizacja lokalnej tablicy odpowiedzi
            setProfileAnswers(prev => 
              prev.map(a => a.id === data.id ? data : a)
            );
            
            toast.success('Odpowiedź została zaktualizowana');
            return true;
          }
        }
      } else {
        // Dodanie nowej odpowiedzi
        const { data, error } = await supabase
          .from('profile_answers')
          .insert({
            user_id: profile.id,
            question_id: questionId,
            answer: answer.trim()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Dodanie nowej odpowiedzi do lokalnej tablicy
          setProfileAnswers(prev => [...prev, data]);
          
          // Odświeżenie kredytów (które zostały przyznane przez trigger)
          await refreshCredits();
          
          toast.success('Dziękujemy za odpowiedź!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Nie udało się zapisać odpowiedzi');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };
  
  // Odświeżenie kredytów użytkownika
  const refreshCredits = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', profile.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCredits(data);
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
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
    profileQuestions,
    profileAnswers,
    loading,
    updateProfile,
    refreshUserData: fetchUserData,
    submitProfileAnswer,
    isQuestionAnswered,
    getQuestionAnswer
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