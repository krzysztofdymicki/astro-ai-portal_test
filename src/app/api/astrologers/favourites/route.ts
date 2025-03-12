// src/app/api/astrologers/favorites/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/astrologers/favorites - pobieranie ulubionych astrologów użytkownika
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Sprawdzenie czy użytkownik jest zalogowany
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Pobieranie ulubionych astrologów
  const { data, error } = await supabase
    .from('user_favorite_astrologers')
    .select(`
      astrologer:astrologers(
        *,
        astrologer_specialties(
          specialty:specialties(name, icon)
        )
      )
    `)
    .eq('user_id', session.user.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Transformacja danych - wyciągamy astrologów z zagnieżdżonej struktury
  const favorites = data.map(item => ({
    ...item.astrologer,
    is_favorite: true
  }));
  
  return NextResponse.json(favorites);
}

// POST /api/astrologers/favorites - dodawanie/usuwanie ulubionego astrologa
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Sprawdzenie czy użytkownik jest zalogowany
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Pobieranie ID astrologa i akcji (add/remove) z ciała żądania
  const { astrologerId, action } = await request.json();
  
  if (action === 'add') {
    // Dodawanie do ulubionych
    const { error } = await supabase
      .from('user_favorite_astrologers')
      .insert({
        user_id: session.user.id,
        astrologer_id: astrologerId
      });
    
    if (error) {
      // Jeśli jest błąd unikalności (już istnieje), ignorujemy
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already favorited' });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Added to favorites' });
  } else if (action === 'remove') {
    // Usuwanie z ulubionych
    const { error } = await supabase
      .from('user_favorite_astrologers')
      .delete()
      .eq('user_id', session.user.id)
      .eq('astrologer_id', astrologerId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Removed from favorites' });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}