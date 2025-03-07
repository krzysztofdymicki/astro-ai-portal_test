import { createClient } from '@/utils/supabase/server';
import { 
  GeneralHoroscope, 
  PersonalHoroscope, 
  HoroscopeType,
  ZodiacSignWithCurrentHoroscope 
} from '@/lib/database.types';
import { cache } from 'react';

/**
 * Pobiera aktualny ogólny horoskop dla znaku zodiaku i typu horoskopu (z cache)
 */
export const getCurrentGeneralHoroscope = cache(async (
  zodiacSignId: string, 
  horoscopeTypeId: string
): Promise<GeneralHoroscope | null> => {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('general_horoscopes')
    .select(`
      *,
      zodiac_sign: zodiac_signs(*),
      horoscope_type: horoscope_types(*)
    `)
    .eq('zodiac_sign_id', zodiacSignId)
    .eq('horoscope_type_id', horoscopeTypeId)
    .lte('valid_from', today)
    .gte('valid_to', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  
  return data as GeneralHoroscope;
});

/**
 * Pobiera wszystkie typy horoskopów (z cache)
 */
export const getAllHoroscopeTypes = cache(async (): Promise<HoroscopeType[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('horoscope_types')
    .select('*')
    .order('name', { ascending: true });
  
  if (error || !data) return [];
  
  return data as HoroscopeType[];
});

/**
 * Pobiera znaki zodiaku wraz z aktualnymi horoskopami dziennymi (z cache)
 */
export const getZodiacSignsWithDailyHoroscopes = cache(async (): Promise<ZodiacSignWithCurrentHoroscope[]> => {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  
  // Pobierz ID typu horoskopu dziennego
  const { data: horoscopeTypeData } = await supabase
    .from('horoscope_types')
    .select('id')
    .eq('duration', 'daily')
    .single();
  
  if (!horoscopeTypeData) return [];
  
  const dailyHoroscopeTypeId = horoscopeTypeData.id;
  
  // Pobierz wszystkie znaki zodiaku z ich aktualnymi horoskopami
  const { data, error } = await supabase
    .from('zodiac_signs')
    .select(`
      *,
      current_horoscope:general_horoscopes!inner(
        *
      )
    `)
    .eq('current_horoscope.horoscope_type_id', dailyHoroscopeTypeId)
    .lte('current_horoscope.valid_from', today)
    .gte('current_horoscope.valid_to', today)
    .order('start_date', { ascending: true });
  
  if (error || !data) return [];
  
  return data as ZodiacSignWithCurrentHoroscope[];
});

/**
 * Pobiera najnowsze horoskopy spersonalizowane dla użytkownika (z cache)
 */
export const getUserPersonalHoroscopes = cache(async (userId: string, limit = 5): Promise<PersonalHoroscope[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('personal_horoscopes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  
  return data as PersonalHoroscope[];
});

/**
 * Pobiera wszystkie horoskopy osobiste użytkownika z informacją, czy zostały przeczytane
 */
export async function getUserPersonalHoroscopesWithReadStatus(userId: string): Promise<(PersonalHoroscope & { isRead: boolean })[]> {
  const supabase = await createClient();
  
  // Pobierz wszystkie horoskopy użytkownika
  const horoscopes = await getUserPersonalHoroscopes(userId, 100);
  
  // Dla każdego horoskopu sprawdź, czy został przeczytany
  const result = await Promise.all(
    horoscopes.map(async (horoscope) => {
      const isRead = await isPersonalHoroscopeReadByUser(userId, horoscope.id);
      return { ...horoscope, isRead };
    })
  );
  
  return result;
}

/**
 * Oznacza horoskop ogólny jako przeczytany przez użytkownika
 */
export async function markGeneralHoroscopeAsRead(userId: string, horoscopeId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Sprawdź, czy horoskop został już oznaczony jako przeczytany
  const { data: existingRead } = await supabase
    .from('general_horoscope_reads')
    .select('id')
    .eq('user_id', userId)
    .eq('horoscope_id', horoscopeId)
    .maybeSingle();
  
  if (existingRead) return true; // Już oznaczony jako przeczytany
  
  // Dodaj nowy wpis
  const { error } = await supabase
    .from('general_horoscope_reads')
    .insert({
      user_id: userId,
      horoscope_id: horoscopeId
    });
  
  return !error;
}

/**
 * Oznacza horoskop spersonalizowany jako przeczytany przez użytkownika
 */
export async function markPersonalHoroscopeAsRead(userId: string, horoscopeId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Sprawdź, czy horoskop został już oznaczony jako przeczytany
  const { data: existingRead } = await supabase
    .from('personal_horoscope_reads')
    .select('id')
    .eq('user_id', userId)
    .eq('horoscope_id', horoscopeId)
    .maybeSingle();
  
  if (existingRead) return true; // Już oznaczony jako przeczytany
  
  // Dodaj nowy wpis
  const { error } = await supabase
    .from('personal_horoscope_reads')
    .insert({
      user_id: userId,
      horoscope_id: horoscopeId
    });
  
  return !error;
}

/**
 * Sprawdza, czy użytkownik przeczytał już dany horoskop ogólny
 */
export async function isGeneralHoroscopeReadByUser(userId: string, horoscopeId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('general_horoscope_reads')
    .select('id')
    .eq('user_id', userId)
    .eq('horoscope_id', horoscopeId)
    .maybeSingle();
  
  return !!data;
}

/**
 * Sprawdza, czy użytkownik przeczytał już dany horoskop spersonalizowany
 */
export async function isPersonalHoroscopeReadByUser(userId: string, horoscopeId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('personal_horoscope_reads')
    .select('id')
    .eq('user_id', userId)
    .eq('horoscope_id', horoscopeId)
    .maybeSingle();
  
  return !!data;
}