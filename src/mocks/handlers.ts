// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// Dane testowe
const testUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Jan',
  last_name: 'Kowalski',
};

// Pełna lista znaków zodiaku
const zodiacSigns = [
  { id: 'aries-id', name: 'Baran', symbol: '♈', element: 'Ogień', start_date: '2000-03-21', end_date: '2000-04-19' },
  { id: 'taurus-id', name: 'Byk', symbol: '♉', element: 'Ziemia', start_date: '2000-04-20', end_date: '2000-05-20' },
  { id: 'gemini-id', name: 'Bliźnięta', symbol: '♊', element: 'Powietrze', start_date: '2000-05-21', end_date: '2000-06-20' },
  { id: 'cancer-id', name: 'Rak', symbol: '♋', element: 'Woda', start_date: '2000-06-21', end_date: '2000-07-22' },
  { id: 'leo-id', name: 'Lew', symbol: '♌', element: 'Ogień', start_date: '2000-07-23', end_date: '2000-08-22' },
  { id: 'virgo-id', name: 'Panna', symbol: '♍', element: 'Ziemia', start_date: '2000-08-23', end_date: '2000-09-22' },
  { id: 'libra-id', name: 'Waga', symbol: '♎', element: 'Powietrze', start_date: '2000-09-23', end_date: '2000-10-22' },
  { id: 'scorpio-id', name: 'Skorpion', symbol: '♏', element: 'Woda', start_date: '2000-10-23', end_date: '2000-11-21' },
  { id: 'sagittarius-id', name: 'Strzelec', symbol: '♐', element: 'Ogień', start_date: '2000-11-22', end_date: '2000-12-21' },
  { id: 'capricorn-id', name: 'Koziorożec', symbol: '♑', element: 'Ziemia', start_date: '2000-12-22', end_date: '2000-01-19' },
  { id: 'aquarius-id', name: 'Wodnik', symbol: '♒', element: 'Powietrze', start_date: '2000-01-20', end_date: '2000-02-18' },
  { id: 'pisces-id', name: 'Ryby', symbol: '♓', element: 'Woda', start_date: '2000-02-19', end_date: '2000-03-20' }
];

export const handlers = [
  // Mock dla logowania
  http.post('*/auth/v1/token*', async ({ request }) => {
    const data = await request.json() as { email: string; password: string };
    const { email, password } = data;
    
    // Przykładowe sprawdzenie z prostym użytkownikiem testowym
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: testUser,
      });
    }
    
    return new HttpResponse(
      JSON.stringify({
        error: 'Invalid login credentials',
        error_description: 'Nieprawidłowy email lub hasło',
      }),
      { status: 400 }
    );
  }),
  
  // Mock dla rejestracji
  http.post('*/auth/v1/signup*', async ({ request }) => {
    const data = await request.json() as { email: string };
    const { email } = data;
    
    // Przykładowe sprawdzenie - odrzucamy adres, który już istnieje
    if (email === 'existing@example.com') {
      return new HttpResponse(
        JSON.stringify({
          error: 'User already registered',
          error_description: 'Użytkownik o podanym adresie email już istnieje',
        }),
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: 'new-user-123',
      email,
    });
  }),
  
  // Mock dla resetowania hasła
  http.post('*/auth/v1/recover*', () => {
    return HttpResponse.json({});
  }),
  
  // Mock dla wylogowania
  http.post('*/auth/v1/logout*', () => {
    return HttpResponse.json({});
  }),
  
  // Mock dla pobrania danych użytkownika
  http.get('*/auth/v1/user*', () => {
    return HttpResponse.json({
      user: testUser,
    });
  }),
  
  // Mock dla profilu użytkownika
  http.get('*/rest/v1/profiles*', () => {
    return HttpResponse.json({
      data: [
        {
          id: testUser.id,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          birth_date: '1990-01-01',
          zodiac_sign_id: 'aries-id',
          profile_completion_percentage: 60,
        }
      ]
    });
  }),
  
  // Mock dla znaków zodiaku
  http.get('*/rest/v1/zodiac_signs*', () => {
    return HttpResponse.json({
      data: zodiacSigns
    });
  }),
];