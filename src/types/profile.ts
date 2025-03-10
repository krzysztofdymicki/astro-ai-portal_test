// src/types/profile.ts

// Profil użytkownika
export interface Profile {
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
  answered_questions_count: number;   // Nowe pole - liczba odpowiedzianych pytań
  total_questions_count: number;      // Nowe pole - całkowita liczba pytań
  created_at: string;
  updated_at: string;
}

// Znak zodiaku
export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: string;
  start_date: string;
  end_date: string;
}

// Kategoria pytań (nowa)
export interface QuestionCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

// Pytanie profilowe (zaktualizowane)
export interface ProfileQuestion {
  id: string;
  question: string;
  credits_reward: number;
  is_active: boolean;
  category_id: string | null;              // Nowe pole
  display_order: number;                   // Nowe pole
  short_description: string | null;        // Nowe pole
  question_categories?: QuestionCategory;  // Relacja do kategorii
}

// Odpowiedź na pytanie
export interface ProfileAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string | null;
  answered_at: string;
}

// Kredyty użytkownika
export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  last_updated: string;
}

// Transakcja kredytowa
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

// Statystyki pytań (nowe)
export interface QuestionsStats {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  earnedCredits: number;
  remainingCredits: number;
}

// Typy horoskopów
export interface HoroscopeType {
  id: string;
  name: string;
  duration: string;
  description: string | null;
}

// Typy stanów związków
export type RelationshipStatus = 
  | 'single' 
  | 'in_relationship' 
  | 'engaged' 
  | 'married' 
  | 'complicated' 
  | 'separated' 
  | 'divorced' 
  | 'widowed';

export const RELATIONSHIP_STATUS_OPTIONS: { value: RelationshipStatus; label: string }[] = [
  { value: 'single', label: 'Singiel/Singielka' },
  { value: 'in_relationship', label: 'W związku' },
  { value: 'engaged', label: 'Zaręczony/a' },
  { value: 'married', label: 'W małżeństwie' },
  { value: 'complicated', label: 'To skomplikowane' },
  { value: 'separated', label: 'W separacji' },
  { value: 'divorced', label: 'Rozwiedziony/a' },
  { value: 'widowed', label: 'Wdowiec/Wdowa' }
];