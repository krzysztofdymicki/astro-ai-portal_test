import { createClient } from '@/utils/supabase/server';
import { Profile, ProfileQuestion, ProfileWithZodiacSign, ZodiacSign } from '@/lib/database.types';
import { cache } from 'react';

/**
 * Pobiera pełny profil użytkownika wraz ze znakiem zodiaku (z cache)
 */
export const getUserProfile = cache(async (userId: string): Promise<ProfileWithZodiacSign | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      zodiac_sign: zodiac_signs(*)
    `)
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  
  return data as ProfileWithZodiacSign;
});

/**
 * Aktualizuje profil użytkownika
 */
export async function updateUserProfile(userId: string, profileData: Partial<Profile>): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);
  
  return !error;
}

/**
 * Pobiera wszystkie znaki zodiaku (z cache)
 */
export const getAllZodiacSigns = cache(async (): Promise<ZodiacSign[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('zodiac_signs')
    .select('*')
    .order('start_date', { ascending: true });
  
  if (error || !data) return [];
  
  return data as ZodiacSign[];
});

/**
 * Pobiera saldo kredytów użytkownika (z cache)
 */
export const getUserCredits = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return 0;
  
  return data.balance;
});

/**
 * Pobiera nieodpowiedziane pytania profilowe dla użytkownika
 */
export async function getUnansweredProfileQuestions(userId: string): Promise<ProfileQuestion[]> {
  const supabase = await createClient();
  
  // Pobieramy wszystkie aktywne pytania
  const { data: allQuestions, error: questionsError } = await supabase
    .from('profile_questions')
    .select('*')
    .eq('is_active', true);
  
  if (questionsError || !allQuestions) return [];
  
  // Pobieramy pytania, na które użytkownik już odpowiedział
  const { data: answers, error: answersError } = await supabase
    .from('profile_answers')
    .select('question_id')
    .eq('user_id', userId);
  
  if (answersError) return [];
  
  // Tworzymy zbiór identyfikatorów pytań, na które udzielono już odpowiedzi
  const answeredQuestionIds = new Set(answers?.map(a => a.question_id) || []);
  
  // Filtrujemy pytania, na które nie udzielono jeszcze odpowiedzi
  return allQuestions.filter(q => !answeredQuestionIds.has(q.id)) as ProfileQuestion[];
}

/**
 * Zapisuje odpowiedź na pytanie profilowe
 */
export async function saveProfileAnswer(
  userId: string, 
  questionId: string, 
  answer: string
): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient();
  
  try {
    // Pobranie pytania, aby wiedzieć ile kredytów przyznać
    const { data: question, error: questionError } = await supabase
      .from('profile_questions')
      .select('*')
      .eq('id', questionId)
      .single();
    
    if (questionError || !question) {
      return { success: false, error: 'Nie znaleziono pytania' };
    }
    
    // Zapisanie odpowiedzi
    const { error: answerError } = await supabase
      .from('profile_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        answer
      });
    
    if (answerError) {
      return { success: false, error: answerError.message };
    }
    
    // Dodanie kredytów
    const { error: creditError } = await supabase.rpc('add_credits', {
      user_id_param: userId,
      amount_param: question.credits_reward
    });
    
    if (creditError) {
      return { success: false, error: creditError.message };
    }
    
    // Dodanie transakcji kredytowej
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: question.credits_reward,
        transaction_type: 'reward',
        description: `Odpowiedź na pytanie profilowe: ${question.question.substring(0, 50)}...`
      });
    
    return { success: true };
    
  } catch (error: any) {
    return { success: false, error: error.message || 'Nieznany błąd' };
  }
}

/**
 * Pobiera pytania profilowe, na które użytkownik już odpowiedział
 */
export async function getAnsweredProfileQuestions(userId: string): Promise<{
  id: string;
  question: ProfileQuestion;
  answer: string;
  answered_at: string;
}[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profile_answers')
    .select(`
      id,
      answer,
      answered_at,
      question:profile_questions(*)
    `)
    .eq('user_id', userId)
    .order('answered_at', { ascending: false });
  
  if (error || !data) return [];
  
  // Transformacja danych do oczekiwanej struktury
  return data.map(item => ({
    id: item.id,
    answer: item.answer,
    answered_at: item.answered_at,
    question: item.question as ProfileQuestion
  }));
}