// src/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen } from '@testing-library/react';
import RootLayout from '../app/layout';

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

/**
 * Helper to get element by text when multiple elements might contain the same text
 * @param container The container to search within
 * @param text The text to search for
 * @param selector Optional CSS selector to filter elements
 * @param index Which occurrence to return (defaults to first)
 */
export function getElementByText(
  container: HTMLElement,
  text: RegExp | string,
  selector?: string,
  index = 0
): HTMLElement {
  const elements = [...container.querySelectorAll(selector || '*')]
    .filter(el => el.textContent && (
      typeof text === 'string' 
        ? el.textContent.includes(text)
        : text.test(el.textContent)
    ));
  
  if (!elements[index]) {
    throw new Error(`Element with text "${text}" at index ${index} not found`);
  }
  
  return elements[index] as HTMLElement;
}

/**
 * Znajduje element po tekście, ale używa selektora do zdefiniowania konkretnego typu elementu
 */
export function getTextInElement(text: RegExp | string, selector: string) {
  return screen.getByText((content, element) => {
    if (!element) return false;
    return element.tagName.toLowerCase() === selector && 
           (typeof text === 'string' ? content === text : text.test(content));
  });
}

/**
 * Znajduje element po tekście, ale używa selektora do zdefiniowania konkretnego typu elementu
 */
export function getElementByTextAndTag(text: RegExp | string, tagName: string) {
  return screen.getByText((content, element) => {
    if (!element) return false;
    return element.tagName.toLowerCase() === tagName && 
           (typeof text === 'string' ? content === text : text.test(content));
  });
}

export const getHeadingByText = (text: RegExp | string) => getElementByTextAndTag(text, 'h1');
export const getParagraphByText = (text: RegExp | string) => getElementByTextAndTag(text, 'p');

// Inne przydatne funkcje pomocnicze
export const getLabelByText = (text: RegExp | string) => getTextInElement(text, 'label');

export function renderWithLayout(ui: React.ReactElement) {
  return render(<RootLayout>{ui}</RootLayout>);
}