// src/app/api/astrologers/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/astrologers/[id] - pobieranie szczegółów konkretnego astrologa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Pobieranie sesji, aby sprawdzić czy użytkownik jest zalogowany
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Pobieranie danych astrologa
  const { data: astrologer, error: astrologerError } = await supabase
    .from('astrologers')
    .select(`
      *,
      astrologer_specialties(
        *,
        specialty:specialties(*)
      ),
      astrologer_credentials(*)
    `)
    .eq('id', params.id)
    .single();
  
  if (astrologerError) {
    return NextResponse.json({ error: astrologerError.message }, { status: 500 });
  }
  
  // Pobieranie recenzji
  const { data: reviews, error: reviewsError } = await supabase
    .from('astrologer_reviews')
    .select(`
      *,
      user_profile:profiles(first_name, last_name)
    `)
    .eq('astrologer_id', params.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  }
  
  // Sprawdzanie czy astrolog jest ulubiony (tylko dla zalogowanych)
  let isFavorite = false;
  if (userId) {
    const { data: favorite } = await supabase
      .from('user_favorite_astrologers')
      .select('id')
      .eq('user_id', userId)
      .eq('astrologer_id', params.id)
      .single();
    
    isFavorite = !!favorite;
  }
  
  // Pobieranie dostępności
  const { data: availability, error: availabilityError } = await supabase
    .from('astrologer_availability')
    .select('*')
    .eq('astrologer_id', params.id)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (availabilityError) {
    return NextResponse.json({ error: availabilityError.message }, { status: 500 });
  }
  
  return NextResponse.json({
    ...astrologer,
    reviews,
    availability,
    is_favorite: isFavorite
  });
}