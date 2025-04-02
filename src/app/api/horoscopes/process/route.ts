// /app/api/horoscopes/process/route.ts
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { ChatCompletion } from 'openai/resources/chat/completions';

// Konfiguracja dla dłuższych czasów wykonania - sprawdź, czy Twój hosting to wspiera
export const maxDuration = 300; // 5 minut
export const runtime = 'nodejs'; // Lub 'edge', zależnie od Twojego hostingu

// Inicjalizacja klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  // Sprawdź secret z nagłówka (opcjonalne zabezpieczenie)
  const webhookSecret = process.env.API_WEBHOOK_SECRET || 'default-webhook-secret';
  const secretHeader = request.headers.get('X-Webhook-Secret');
  
  if (secretHeader !== webhookSecret) {
    console.error('Nieprawidłowy secret webhoooka');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Brak wymaganego parametru orderId' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Przetwarzanie horoskopu
    await processHoroscope(orderId);

    return new Response(JSON.stringify({ success: true }), { 
      headers: { 'Content-Type': 'application/json' }
    });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Błąd podczas przetwarzania horoskopu:', error);
    return new Response(JSON.stringify({ 
      error: 'Wystąpił błąd podczas przetwarzania horoskopu',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Główna funkcja przetwarzająca horoskop
async function processHoroscope(orderId: string) {
  console.log(`Rozpoczynam przetwarzanie zamówienia ${orderId}`);
  
  try {
    // Inicjalizacja klienta Supabase
    const supabase = await createClient();

    // 1. Pobierz dane zamówienia
    const { data: orderData, error: orderError } = await supabase
      .from('horoscope_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Nie znaleziono zamówienia:', orderError);
      return;
    }

    // 2. Sprawdź, czy zamówienie jest w stanie "processing"
    if (orderData.status !== 'processing') {
      console.log(`Zamówienie ${orderId} ma nieprawidłowy status: ${orderData.status}`);
      return;
    }

    // 3. Pobierz dane użytkownika
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', orderData.user_id)
      .single();

    if (profileError || !profileData) {
      console.error('Nie znaleziono profilu użytkownika:', profileError);
      return;
    }

    // 4. Pobierz znak zodiaku użytkownika
    const { data: zodiacData } = await supabase
      .from('zodiac_signs')
      .select('*')
      .eq('slug', profileData.zodiac_sign)
      .single();

    // 5. Pobierz odpowiedzi użytkownika na pytania profilowe
    const { data: userAnswers } = await supabase
      .from('profile_answers')
      .select('*')
      .eq('user_id', orderData.user_id)
      .single();

    // Przygotowanie informacji o odpowiedziach dla promptu
    let answersInfo = '';
    if (userAnswers && userAnswers.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answersInfo = userAnswers.map((answer: any) => {
        return `Pytanie: ${answer.profile_questions.question}\nOdpowiedź: ${answer.answer}`;
      }).join('\n\n');
    }

    // 6. Przygotowanie informacji o użytkowniku na podstawie profilu
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

    // 7. Przygotowanie danych dla horoskopu
    const horoscopeType = orderData.horoscope_type;
    const horoscopeTypes = {
      daily: 'dzień',
      weekly: 'tydzień',
      monthly: 'miesiąc',
      yearly: 'rok',
      lifetime: 'życie'
    };

    const period = horoscopeTypes[horoscopeType as keyof typeof horoscopeTypes] || 'okres';

    // 8. Ustalenie okresów ważności horoskopu
    const validFrom = new Date().toISOString();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validTo = null as any;
        break;
    }

    // 9. Przygotowanie promptu dla LLM
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

    // 10. Wysłanie zapytania do OpenAI
    console.log(`Generowanie treści horoskopu dla zamówienia ${orderId}`);
    const completion: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o", // lub inny wybrany model
      messages: [
        { role: "system", content: "Jesteś profesjonalnym astrologiem, który tworzy spersonalizowane horoskopy w języku polskim." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // 11. Uzyskanie wygenerowanej treści horoskopu
    const horoscopeContent = completion.choices[0]?.message?.content || 'Nie udało się wygenerować horoskopu.';

    // 12. Tytuł horoskopu
    const horoscopeTitle = `Horoskop ${
      horoscopeType === 'daily' ? 'dzienny' :
      horoscopeType === 'weekly' ? 'tygodniowy' :
      horoscopeType === 'monthly' ? 'miesięczny' :
      horoscopeType === 'yearly' ? 'roczny' : 'życiowy'
    }`;

    // 13. Zapisanie horoskopu w bazie danych
    console.log(`Zapisywanie horoskopu dla zamówienia ${orderId}`);
    const { data: horoscopeData, error: horoscopeError } = await supabase
      .from('horoscopes')
      .insert({
        order_id: orderId,
        user_id: orderData.user_id,
        astrologer_id: orderData.astrologer_id,
        horoscope_type: horoscopeType,
        title: horoscopeTitle,
        content: horoscopeContent,
        valid_from: validFrom,
        valid_to: validTo ? validTo.toISOString().split('T')[0] : null,
        zodiac_sign: profileData.zodiac_sign || null
      })
      .select()
      .single();

    if (horoscopeError) {
      console.error('Nie udało się zapisać horoskopu:', horoscopeError);
      return;
    }

    // 14. Aktualizacja statusu zamówienia na "completed"
    const { error: completeError } = await supabase
      .from('horoscope_orders')
      .update({ 
        status: 'completed',
        horoscope_id: horoscopeData.id,
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (completeError) {
      console.error('Nie udało się zaktualizować statusu zamówienia:', completeError);
      return;
    }

    console.log(`Zakończono przetwarzanie zamówienia ${orderId}`);

  } catch (error) {
    console.error(`Błąd podczas przetwarzania zamówienia ${orderId}:`, error);
    throw error; // Rzuć błąd dalej, aby został zarejestrowany w logach
  }
}