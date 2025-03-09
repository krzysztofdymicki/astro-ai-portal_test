// src/types/profile.ts

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
    created_at: string;
    updated_at: string;
  }
  
  export interface ZodiacSign {
    id: string;
    name: string;
    symbol: string;
    element: string;
    start_date: string;
    end_date: string;
  }
  
  export interface UserCredits {
    id: string;
    user_id: string;
    balance: number;
    last_updated: string;
  }
  
  export interface CreditTransaction {
    id: string;
    user_id: string;
    amount: number;
    transaction_type: string;
    description: string | null;
    created_at: string;
  }
  
  export interface ProfileQuestion {
    id: string;
    question: string;
    credits_reward: number;
    is_active: boolean;
  }
  
  export interface ProfileAnswer {
    id: string;
    user_id: string;
    question_id: string;
    answer: string | null;
    answered_at: string;
  }
  
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