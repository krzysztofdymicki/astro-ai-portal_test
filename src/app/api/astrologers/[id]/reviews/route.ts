// src/app/api/astrologers/[id]/reviews/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/astrologers/[id]/reviews - dodawanie nowej recenzji
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Sprawdzenie czy użytkownik jest zalogowany
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Pobieranie danych recenzji z ciała żądania
  const { rating, comment } = await request.json();
  
  // Walidacja
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }
  
  // Sprawdzenie czy użytkownik już dodał recenzję dla tego astrologa
  const { data: existingReview } = await supabase
    .from('astrologer_reviews')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('astrologer_id', params.id)
    .single();
  
  if (existingReview) {
    // Aktualizacja istniejącej recenzji
    const { error } = await supabase
      .from('astrologer_reviews')
      .update({
        rating,
        comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingReview.id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Review updated successfully' });
  } else {
    // Dodanie nowej recenzji
    const { error } = await supabase
      .from('astrologer_reviews')
      .insert({
        astrologer_id: params.id,
        user_id: session.user.id,
        rating,
        comment,
        is_verified: false, // Domyślnie recenzja nie jest zweryfikowana
        is_published: true, // Domyślnie publikujemy od razu
      });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Review added successfully' });
  }
}