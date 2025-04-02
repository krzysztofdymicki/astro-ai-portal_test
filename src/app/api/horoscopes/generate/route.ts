// /app/api/horoscopes/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // Sprawdź, czy zamówienie istnieje i czy ma status "pending"
    const supabase = await createClient();
    const { data: orderData, error: orderError } = await supabase
      .from('horoscope_orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Nie znaleziono zamówienia' },
        { status: 404 }
      );
    }

    if (orderData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Zamówienie jest już w trakcie realizacji lub zostało zakończone' },
        { status: 400 }
      );
    }

    // Zaktualizuj status na "processing"
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

    // Wygeneruj klucz bezpieczeństwa dla webhooków (opcjonalnie)
    const webhookSecret = process.env.API_WEBHOOK_SECRET || 'default-webhook-secret';

    // Wywołaj webhook do przetwarzania horoskopu
    const webhookUrl = new URL('/api/horoscopes/process', request.url);
    fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify({ orderId })
    }).catch(err => {
      console.error('Błąd wywołania webhoooka:', err);
    });

    // Natychmiastowa odpowiedź dla klienta
    return NextResponse.json({
      success: true,
      message: 'Proces generowania horoskopu został rozpoczęty'
    });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Błąd inicjacji procesu generowania horoskopu:', error);
    return NextResponse.json(
      { error: 'Wystąpił nieoczekiwany błąd', details: error.message },
      { status: 500 }
    );
  }
}