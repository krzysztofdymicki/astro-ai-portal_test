// src/__tests__/supabase-client.test.ts
import { createClient } from '../utils/supabase/client';
import { createBrowserClient } from '@supabase/ssr';

// Mock modułów
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('Supabase Client', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mockowanie zmiennych środowiskowych
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'example-anon-key',
    };
  });
  
  afterAll(() => {
    // Przywrócenie oryginalnych zmiennych środowiskowych
    process.env = originalEnv;
  });

  test('createClient wywołuje createBrowserClient z odpowiednimi parametrami', () => {
    // Mockowanie zwracanej wartości z createBrowserClient
    const mockSupabaseClient = { auth: { signIn: jest.fn() } };
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    
    // Wywołanie createClient
    const client = createClient();
    
    // Sprawdzenie czy createBrowserClient zostało wywołane z odpowiednimi parametrami
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'example-anon-key'
    );
    
    // Sprawdzenie czy client jest zwrócony z createBrowserClient
    expect(client).toEqual(mockSupabaseClient);
  });

  test('createClient zwraca błąd gdy brakuje zmiennych środowiskowych', () => {
    // Usunięcie zmiennych środowiskowych
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Sprawdzenie czy createClient rzuca błąd
    expect(() => createClient()).toThrow();
  });
});