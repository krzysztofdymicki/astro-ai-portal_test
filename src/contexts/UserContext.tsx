'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { getZodiacSignById, getZodiacSignFromDate, isDateCompleteForZodiac, ZodiacInfo } from '@/lib/zodiac-utils';

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
  zodiac_sign: string | null;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

// Interfejs dla kredytów
export interface UserCredits {
  balance: number;
  last_updated?: string;
}

// Interfejs dla kategorii pytań
interface QuestionCategory {
  name: string;
  icon: string | null;
}

// Interfejs dla odpowiedzi
interface ProfileAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string | null;
  answered_at: string;
}

// Rozszerzony interfejs pytania z zintegrowaną odpowiedzią
export interface ProfileQuestionWithAnswer {
  id: string;
  question: string;
  credits_reward: number;
  is_active: boolean;
  category_id?: string | null;
  display_order?: number;
  short_description?: string | null;
  question_categories?: QuestionCategory | null;
  
  // Zintegrowana odpowiedź (opcjonalnie, dla pytań bez odpowiedzi)
  answer: ProfileAnswer | null;
}

// Prosty interfejs stanu ładowania
interface LoadingState {
  initial: boolean;
  profile: boolean;
  questions: boolean;
  submitting: boolean;
}

// Statystyki pytań
interface QuestionsStats {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  earnedCredits: number;
  remainingCredits: number;
}

interface UserContextType {
  // Dane użytkownika
  profile: UserProfile | null;
  userEmail: string;
  userName: string;
  userInitials: string;
  credits: UserCredits | null;
  
  // Informacje o znaku zodiaku
  zodiacSign: ZodiacInfo | null;
  
  // Pytania z zintegrowanymi odpowiedziami
  profileQuestions: ProfileQuestionWithAnswer[];
  
  // Statystyki pytań
  questionsStats: QuestionsStats;
  
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
    submitting: false
  });
  
  // Dane podstawowe
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Użytkownik');
  const [userInitials, setUserInitials] = useState('U');
  const [credits, setCredits] = useState<UserCredits | null>(null);
  
  // Znak zodiaku użytkownika
  const [zodiacSign, setZodiacSign] = useState<ZodiacInfo | null>(null);
  
  // Pytania z zintegrowanymi odpowiedziami
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestionWithAnswer[]>([]);
  
  // Statystyki pytań (domyślne wartości)
  const [questionsStats, setQuestionsStats] = useState<QuestionsStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    completionPercentage: 0,
    earnedCredits: 0,
    remainingCredits: 0
  });

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
        
        // Ustawienie znaku zodiaku
        if (profileData.zodiac_sign) {
          const signInfo = getZodiacSignById(profileData.zodiac_sign);
          setZodiacSign(signInfo);
        } else if (profileData.birth_date && isDateCompleteForZodiac(profileData.birth_date)) {
          const signFromDate = getZodiacSignFromDate(profileData.birth_date);
          setZodiacSign(signFromDate);
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
      
      // Pobieranie pytań i odpowiedzi za pomocą jednego zapytania z LEFT JOIN
      setLoading(prev => ({ ...prev, questions: true }));
      
      // Pobierz wszystkie aktywne pytania i ich ewentualne odpowiedzi dla danego użytkownika
      // Supabase domyślnie używa LEFT JOIN, więc zwróci wszystkie pytania nawet bez odpowiedzi
      const { data: questions, error: questionsError } = await supabase
        .from('profile_questions')
        .select(`
          *,
          question_categories(name, icon),
          profile_answers(*)
        `)
        .eq('is_active', true)
        .eq('profile_answers.user_id', userId)
        .order('display_order', { ascending: true });
        
      if (questionsError) throw questionsError;
      
      if (!questions || questions.length === 0) {
        setProfileQuestions([]);
        setLoading(prev => ({ ...prev, questions: false }));
        return;
      }
      
      // Przekształć pobrane dane do naszego formatu
      const questionsWithAnswers: ProfileQuestionWithAnswer[] = questions.map(question => {
        // Pobierz odpowiedź użytkownika dla tego pytania (będzie w tablicy profile_answers)
        const answerArray = question.profile_answers as unknown as ProfileAnswer[];
        const answer = answerArray && answerArray.length > 0 ? answerArray[0] : null;
        
        // Usuń tablicę profile_answers i zastąp ją pojedynczym obiektem answer
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { profile_answers: _, ...questionData } = question;
        
        return {
          ...questionData,
          answer
        };
      });
      
      setProfileQuestions(questionsWithAnswers);
      updateQuestionsStats(questionsWithAnswers);
      
      setProfileQuestions(questionsWithAnswers);
      
      // Obliczenie statystyk
      if (questionsWithAnswers.length > 0) {
        updateQuestionsStats(questionsWithAnswers);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Nie udało się pobrać danych użytkownika');
    } finally {
      setLoading(prev => ({ ...prev, initial: false, questions: false }));
    }
  };
  
  // Aktualizacja statystyk pytań
  const updateQuestionsStats = (questions: ProfileQuestionWithAnswer[]) => {
    if (!questions.length) return;
    
    const answeredQuestions = questions.filter(q => q.answer !== null);
    const answeredCount = answeredQuestions.length;
    const totalQuestions = questions.length;
    const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);
    
    // Obliczenie zdobytych kredytów
    const earnedCredits = answeredQuestions.reduce((sum, q) => sum + q.credits_reward, 0);
    
    // Obliczenie pozostałych do zdobycia kredytów
    const remainingCredits = questions
      .filter(q => q.answer === null)
      .reduce((sum, q) => sum + q.credits_reward, 0);
    
    setQuestionsStats({
      totalQuestions,
      answeredQuestions: answeredCount,
      completionPercentage,
      earnedCredits,
      remainingCredits
    });
  };

  // Funkcja do aktualizacji profilu
  const updateProfile = async (newProfileData: Partial<UserProfile>) => {
    try {
      if (!profile?.id) {
        throw new Error('Brak ID profilu');
      }
      
      setLoading(prev => ({ ...prev, profile: true }));
      
      // Jeśli zmieniamy datę urodzenia, sprawdźmy czy możemy określić znak zodiaku
      if (newProfileData.birth_date && isDateCompleteForZodiac(newProfileData.birth_date)) {
        const zodiacSignInfo = getZodiacSignFromDate(newProfileData.birth_date);
        if (zodiacSignInfo) {
          // Aktualizacja pola zodiac_sign na podstawie daty urodzenia
          newProfileData.zodiac_sign = zodiacSignInfo.id;
        }
      }
      
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
        
        // Aktualizacja znaku zodiaku, jeśli się zmienił
        if (data.zodiac_sign) {
          const signInfo = getZodiacSignById(data.zodiac_sign);
          setZodiacSign(signInfo);
        } else if (data.birth_date && isDateCompleteForZodiac(data.birth_date)) {
          const signFromDate = getZodiacSignFromDate(data.birth_date);
          setZodiacSign(signFromDate);
        } else {
          setZodiacSign(null);
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
    const question = profileQuestions.find(q => q.id === questionId);
    return question?.answer !== null;
  };
  
  // Pobranie odpowiedzi na pytanie
  const getQuestionAnswer = (questionId: string): string | null => {
    const question = profileQuestions.find(q => q.id === questionId);
    return question?.answer?.answer || null;
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
      const questionIndex = profileQuestions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) {
        throw new Error('Pytanie nie istnieje');
      }
      
      const question = profileQuestions[questionIndex];
      
      if (question.answer) {
        // Aktualizacja istniejącej odpowiedzi
        const { data, error } = await supabase
          .from('profile_answers')
          .update({ answer: answer.trim() })
          .eq('id', question.answer.id)
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Aktualizacja lokalnego stanu
          const updatedQuestion = {
            ...question,
            answer: data
          };
          
          const updatedQuestions = [...profileQuestions];
          updatedQuestions[questionIndex] = updatedQuestion;
          
          setProfileQuestions(updatedQuestions);
          updateQuestionsStats(updatedQuestions);
          
          toast.success('Odpowiedź została zaktualizowana');
          return true;
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
          // Aktualizacja lokalnego stanu
          const updatedQuestion = {
            ...question,
            answer: data
          };
          
          const updatedQuestions = [...profileQuestions];
          updatedQuestions[questionIndex] = updatedQuestion;
          
          setProfileQuestions(updatedQuestions);
          updateQuestionsStats(updatedQuestions);
          
          // Odświeżenie kredytów (które zostały przyznane przez trigger)
          await refreshCredits();
          
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    zodiacSign,
    profileQuestions,
    questionsStats,
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