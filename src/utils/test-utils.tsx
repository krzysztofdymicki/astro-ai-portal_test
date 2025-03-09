// src/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Deklaracja interfejsu dla rozszerzonych opcji renderowania
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Tutaj możemy dodać dodatkowe opcje, np. wstępny stan komponentu
  initialState?: any;
  route?: string;
}

// Funkcja pomocnicza do renderowania komponentów (będzie rozszerzana w przyszłości)
export function renderWithProviders(
  ui: ReactElement,
  { initialState, route = '/', ...renderOptions }: ExtendedRenderOptions = {}
) {
  // Funkcja do opakowywania komponentów w niezbędne providery (np. AuthProvider, ThemeProvider, itp.)
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Można tutaj dodać providery, które będą używane do testów
    return (
      <>
        {children}
      </>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Funkcja pomocnicza do mockowania Supabase
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
    resend: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock dla createClient z @/utils/supabase/client
export const mockCreateClient = jest.fn(() => mockSupabaseClient);

// Funkcja do mockowania efektywnego stanu uwierzytelnienia
export function mockAuthState(authenticated = true) {
  if (authenticated) {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: '2023-01-01T00:00:00Z',
        }
      },
      error: null,
    });
  } else {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  }
}

// Funkcja do mockowania lokalnego storage
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    }),
  };
}