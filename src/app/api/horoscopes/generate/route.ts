// /app/api/horoscopes/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

// Inicjalizacja klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Parsowanie danych z żądania
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Brak wymaganego parametru orderId' },
        { status: 400 }
      );
    }

    // Inicjalizacja klienta Supabase
    const supabase = await createClient();

    // Pobranie danych sesji użytkownika
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Nieautoryzowany dostęp' },
        { status: 401 }
      );
    }

    // Pobranie danych zamówienia
    const { data: orderData, error: orderError } = await supabase
      .from('horoscope_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Nie znaleziono zamówienia' },
        { status: 404 }
      );
    }

    // Sprawdzenie statusu zamówienia
    if (orderData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Zamówienie jest już w trakcie realizacji lub zostało zrealizowane' },
        { status: 400 }
      );
    }

    // Aktualizacja statusu zamówienia na "processing"
    const { error: updateError } = await supabase
      .from('horoscope_orders')
      .update({ status: 'processing' })
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Nie udało się zaktualizować statusu zamówienia' },
        { status: 500 }
      );
    }

    // Pobranie danych użytkownika
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Nie znaleziono profilu użytkownika' },
        { status: 404 }
      );
    }

    // Pobranie znaku zodiaku użytkownika
    const { data: zodiacData, error: zodiacError } = await supabase
      .from('zodiac_signs')
      .select('*')
      .eq('id', profileData.zodiac_sign_id)
      .single();

    // Pobranie odpowiedzi użytkownika na pytania profilowe
    const { data: answersData, error: answersError } = await supabase
      .from('profile_answers')
      .select(`
        *,
        profile_questions(question)
      `)
      .eq('user_id', session.user.id);

    // Przygotowanie informacji o odpowiedziach dla promptu
    let answersInfo = '';
    if (answersData && answersData.length > 0) {
      answersInfo = answersData.map((answer: any) => {
        return `Pytanie: ${answer.profile_questions.question}\nOdpowiedź: ${answer.answer}`;
      }).join('\n\n');
    }

    // Przygotowanie informacji o użytkowniku na podstawie profilu
    const userInfo = {
      firstName: profileData.first_name || 'Użytkownik',
      lastName: profileData.last_name || '',
      birthDate: profileData.birth_date || 'Nieznana',
      birthTime: profileData.birth_time || 'Nieznana',
      birthLocation: profileData.birth_location || 'Nieznana',
      currentLocation: profileData.current_location || 'Nieznana',
      relationshipStatus: profileData.relationship_status || 'Nieznany',
      zodiacSign: zodiacData ? zodiacData.name : 'Nieznany',
      zodiacElement: zodiacData ? zodiacData.element : 'Nieznany',
    };

    // Przygotowanie danych dla horoskopu
    const horoscopeType = orderData.horoscope_type;
    const horoscopeTypes = {
      daily: 'dzień',
      weekly: 'tydzień',
      monthly: 'miesiąc',
      yearly: 'rok',
      lifetime: 'życie'
    };

    const period = horoscopeTypes[horoscopeType as keyof typeof horoscopeTypes] || 'okres';

    // Ustalenie okresów ważności horoskopu
    let validFrom = new Date();
    let validTo = new Date();
    
    switch (horoscopeType) {
      case 'daily':
        validTo.setDate(validTo.getDate() + 1);
        break;
      case 'weekly':
        validTo.setDate(validTo.getDate() + 7);
        break;
      case 'monthly':
        validTo.setMonth(validTo.getMonth() + 1);
        break;
      case 'yearly':
        validTo.setFullYear(validTo.getFullYear() + 1);
        break;
      case 'lifetime':
        // Horoskop życiowy nie ma daty ważności
        validTo = null as any;
        break;
    }

    // Przygotowanie promptu dla LLM
    const prompt = `Wygeneruj horoskop ${horoscopeType} dla użytkownika o następujących cechach:
    
Imię: ${userInfo.firstName}
Nazwisko: ${userInfo.lastName}
Data urodzenia: ${userInfo.birthDate}
Godzina urodzenia: ${userInfo.birthTime}
Miejsce urodzenia: ${userInfo.birthLocation}
Obecna lokalizacja: ${userInfo.currentLocation}
Stan związku: ${userInfo.relationshipStatus}
Znak zodiaku: ${userInfo.zodiacSign}
Element: ${userInfo.zodiacElement}

Dodatkowe informacje o użytkowniku z jego odpowiedzi na pytania:
${answersInfo}

Uwagi użytkownika do horoskopu:
${orderData.user_notes || 'Brak uwag'}

Horoskop powinien być spersonalizowany i obejmować następujące aspekty:
1. Ogólny wpływ układu planet na następny ${period}
2. Miłość i relacje międzyludzkie
3. Kariera i finanse
4. Zdrowie i samopoczucie
5. Rozwój osobisty
6. Szczęśliwe dni/kolory/liczby (jeśli dotyczy)

Horoskop powinien być napisany w języku polskim, w profesjonalnym ale przyjaznym tonie. Tekst powinien być sformatowany z użyciem znaczników HTML (paragrafy <p>, nagłówki <h3>, etc.) dla lepszej czytelności. Długość horoskopu powinna być odpowiednia do jego typu - dłuższy dla horoskopów miesięcznych, rocznych i życiowych; krótszy dla dziennych i tygodniowych.`;

    // Wysłanie zapytania do OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // lub inny wybrany model
      messages: [
        { role: "system", content: "Jesteś profesjonalnym astrologiem, który tworzy spersonalizowane horoskopy w języku polskim." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Uzyskanie wygenerowanej treści horoskopu
    const horoscopeContent = completion.choices[0]?.message?.content || 'Nie udało się wygenerować horoskopu.';

    // Tytuł horoskopu
    const horoscopeTitle = `Horoskop ${
      horoscopeType === 'daily' ? 'dzienny' :
      horoscopeType === 'weekly' ? 'tygodniowy' :
      horoscopeType === 'monthly' ? 'miesięczny' :
      horoscopeType === 'yearly' ? 'roczny' : 'życiowy'
    } dla znaku ${userInfo.zodiacSign}`;

    // Zapisanie horoskopu w bazie danych
    const { data: horoscopeData, error: horoscopeError } = await supabase
      .from('horoscopes')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        astrologer_id: orderData.astrologer_id,
        horoscope_type: horoscopeType,
        title: horoscopeTitle,
        content: horoscopeContent,
        valid_from: validFrom.toISOString().split('T')[0],
        valid_to: validTo ? validTo.toISOString().split('T')[0] : null,
        zodiac_sign: userInfo.zodiacSign
      })
      .select()
      .single();

    if (horoscopeError) {
      return NextResponse.json(
        { error: 'Nie udało się zapisać horoskopu', details: horoscopeError },
        { status: 500 }
      );
    }

    // Aktualizacja statusu zamówienia na "completed"
    const { error: completeError } = await supabase
      .from('horoscope_orders')
      .update({ 
        status: 'completed',
        horoscope_id: horoscopeData.id,
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (completeError) {
      return NextResponse.json(
        { error: 'Nie udało się zaktualizować statusu zamówienia', details: completeError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Horoskop został pomyślnie wygenerowany',
      horoscopeId: horoscopeData.id
    });

  } catch (error: any) {
    console.error('Błąd podczas generowania horoskopu:', error);
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd', details: error.message },
      { status: 500 }
    );
  }
}