// src/mocks/handlers.ts
import { rest } from 'msw';

// Dane testowe
const testUser = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Jan',
  last_name: 'Kowalski',
};

export const handlers = [
  // Mock dla logowania
  rest.post('*/auth/v1/token*', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    // Przykładowe sprawdzenie z prostym użytkownikiem testowym
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          user: testUser,
        })
      );
    }
    
    return res(
      ctx.status(400),
      ctx.json({
        error: 'Invalid login credentials',
        error_description: 'Nieprawidłowy email lub hasło',
      })
    );
  }),
  
  // Mock dla rejestracji
  rest.post('*/auth/v1/signup*', (req, res, ctx) => {
    const { email } = req.body as any;
    
    // Przykładowe sprawdzenie - odrzucamy adres, który już istnieje
    if (email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'User already registered',
          error_description: 'Użytkownik o podanym adresie email już istnieje',
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        id: 'new-user-123',
        email,
      })
    );
  }),
  
  // Mock dla resetowania hasła
  rest.post('*/auth/v1/recover*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({})
    );
  }),
  
  // Mock dla wylogowania
  rest.post('*/auth/v1/logout*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({})
    );
  }),
  
  // Mock dla pobrania danych użytkownika
  rest.get('*/auth/v1/user*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: testUser,
      })
    );
  }),
  
  // Mock dla profilu użytkownika
  rest.get('*/rest/v1/profiles*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  
  // Mock dla znaków zodiaku
  rest.get('*/rest/v1/zodiac_signs*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          { id: 'aries-id', name: 'Baran', symbol: '♈', element: 'Ogień', start_date: '2000-03-21', end_date: '2000-04-19' },
          { id: 'taurus-id', name: 'Byk', symbol: '♉', element: 'Ziemia', start_date: '2000-04-20', end_date: '2000-05-20' },
          // Pozostałe znaki zodiaku...
        ]
      })
    );
  }),
];