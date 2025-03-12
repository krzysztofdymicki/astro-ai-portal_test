// src/app/api/astrologers/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/astrologers - pobieranie listy astrologów
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const specialty = searchParams.get('specialty');
  const minRating = searchParams.get('minRating');
  const minExperience = searchParams.get('minExperience');
  const searchQuery = searchParams.get('query');
  
  const supabase = createRouteHandlerClient({ cookies });
  
  // Budowanie zapytania
  let query = supabase
    .from('astrologers')
    .select(`
      *,
      astrologer_specialties(
        *,
        specialty:specialties(*)
      )
    `);
  
  // Filtrowanie po specjalizacji
  if (specialty) {
    query = query.or(`astrologer_specialties.specialty_id.eq.${specialty}`);
  }
  
  // Filtrowanie po minimalnej ocenie
  if (minRating) {
    query = query.gte('rating_average', minRating);
  }
  
  // Filtrowanie po minimalnym doświadczeniu
  if (minExperience) {
    query = query.gte('years_of_experience', minExperience);
  }
  
  // Filtrowanie po wyszukiwanej frazie
  if (searchQuery) {
    query = query.or(`display_name.ilike.%${searchQuery}%,short_bio.ilike.%${searchQuery}%`);
  }
  
  // Wykonanie zapytania
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}