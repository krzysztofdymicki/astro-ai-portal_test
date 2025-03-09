// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Obsługa logowania użytkownika
  http.post('https://example.supabase.co/auth/v1/token', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string } | null;
    
    // Obsługa różnych przypadków testowych na podstawie emaila
    if (body && body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        },
      });
    } else {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Invalid login credentials',
      });
    }
  }),
  
  // Obsługa rejestracji użytkownika
  http.post('https://example.supabase.co/auth/v1/signup', async ({ request }) => {
    const body = await request.json() as { email?: string } | null;
    
    // Obsługa różnych przypadków testowych na podstawie emaila
    if (body && body.email === 'existing@example.com') {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'User already registered',
      });
    } else {
      return HttpResponse.json({
        id: 'new-user-id',
        email: body?.email || 'unknown@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      });
    }
  }),
  
  // Obsługa wylogowania
  http.post('https://example.supabase.co/auth/v1/logout', () => {
    return HttpResponse.json({});
  }),
  
  // Obsługa resetowania hasła
  http.post('https://example.supabase.co/auth/v1/recover', async ({ request }) => {
    const body = await request.json() as { email?: string } | null;
    
    if (body && body.email === 'nonexistent@example.com') {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Email not found',
      });
    } else {
      return HttpResponse.json({});
    }
  }),
  
  // Obsługa aktualizacji użytkownika (np. hasła)
  http.put('https://example.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
    });
  }),
  
  // Obsługa ponownego wysłania maila
  http.post('https://example.supabase.co/auth/v1/resend', async ({ request }) => {
    const body = await request.json() as { email?: string } | null;
    
    if (body && body.email === 'error@example.com') {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Error sending email',
      });
    } else {
      return HttpResponse.json({});
    }
  }),
  
  // Obsługa pobierania danych użytkownika
  http.get('https://example.supabase.co/auth/v1/user', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader?.includes('mock-access-token')) {
      return HttpResponse.json({
        id: 'test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      });
    } else {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
  }),
];