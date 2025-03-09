// src/__tests__/dashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../app/dashboard/page';
import { toast } from 'sonner';
import * as supabaseClient from '../utils/supabase/client';
import { mockCreateClient, mockSupabaseClient } from '../utils/test-utils';
import { within } from '@testing-library/react';

// Mock modułów
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock dla komponentu CosmicBackground
jest.mock('../components/background/CosmicBackground', () => ({
  __esModule: true,
  default: () => <div data-testid="cosmic-background" />
}));

// Pomocnicza funkcja do znajdowania elementów w portalach
interface FindElementInPortalsParams {
  dataTestId: string;
  timeoutMs?: number;
}

const findElementInPortals = async ({ dataTestId, timeoutMs = 200 }: FindElementInPortalsParams): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const element = document.querySelector(`[data-testid="${dataTestId}"]`) as HTMLElement | null;
      if (element) {
        resolve(element);
      } else {
        reject(new Error(`Nie znaleziono elementu [data-testid="${dataTestId}"]`));
      }
    }, timeoutMs);
  });
};

describe('Dashboard Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Reset wszystkich mocków przed każdym testem
    jest.clearAllMocks();
    
    // Mockowanie useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mockowanie createClient
    (supabaseClient.createClient as jest.Mock).mockImplementation(mockCreateClient);
    
    // Mockowanie podstawowych danych użytkownika
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com' 
        } 
      },
      error: null,
    });
    
    // Mockowanie danych profilu
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'test-user-id',
                  first_name: 'Jan',
                  last_name: 'Kowalski',
                  birth_date: '1990-01-01',
                  profile_completion_percentage: 60,
                  zodiac_sign_id: 'zodiac-sign-id'
                },
                error: null
              })
            })
          })
        };
      }
      if (table === 'user_credits') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { balance: 25 },
                error: null
              })
            })
          })
        };
      }
      return mockSupabaseClient;
    });
  });

  test('renderuje dashboard z prawidłowymi elementami UI', async () => {
    render(<Dashboard />);
    
    // Czekamy na załadowanie danych użytkownika
    await waitFor(() => {
      // Sprawdzenie podstawowych elementów
      expect(screen.getByText('Twoja Przepowiednia')).toBeInTheDocument();
      
      // Sprawdzenie czy menu użytkownika jest renderowane
      expect(screen.getByTestId('user-avatar-button')).toBeInTheDocument();
      
      // Sprawdzenie czy kafelki dashboardu są wyświetlane
      expect(screen.getByText('Twój Profil Astralny')).toBeInTheDocument();
      expect(screen.getByText('Pytania Dodatkowe')).toBeInTheDocument();
      expect(screen.getByText('Twoje Horoskopy')).toBeInTheDocument();
    });
  });

  // Poniżej trzeba będzie zaimplementować test
  test('obsługuje wylogowanie użytkownika', async () => { });

  // Poniżej trzeba będzie zaimplementować testy
  test('wyświetla błąd dla nieudanego wylogowania', async () => {});

  test('przekierowuje do strony profilu po kliknięciu "Uzupełnij profil"', async () => {
    render(<Dashboard />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByText('Uzupełnij profil')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const profileButton = screen.getByRole('link', { name: /uzupełnij profil/i });
    expect(profileButton).toHaveAttribute('href', '/dashboard/profile');
  });

  test('przekierowuje do strony pytań po kliknięciu "Odpowiedz na pytania"', async () => {
    render(<Dashboard />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByText('Odpowiedz na pytania')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const questionsButton = screen.getByRole('link', { name: /odpowiedz na pytania/i });
    expect(questionsButton).toHaveAttribute('href', '/dashboard/questions');
  });

  test('przekierowuje do strony horoskopów po kliknięciu "Przeglądaj horoskopy"', async () => {
    render(<Dashboard />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByText('Przeglądaj horoskopy')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const horoscopesButton = screen.getByRole('link', { name: /przeglądaj horoskopy/i });
    expect(horoscopesButton).toHaveAttribute('href', '/dashboard/horoscopes');
  });

  // Poniżej trzeba będzie zaimplementować testy
  test('wyświetla menu użytkownika po kliknięciu awatara', async () => { });

  // Poniżej trzeba będzie zaimplementować testy
  test('link "Mój profil" w menu użytkownika prowadzi do strony profilu', async () => {});

  test('wyświetla prawidłowe dane profilu użytkownika', async () => {
    render(<Dashboard />);
    
    // Czekamy na załadowanie danych użytkownika
    await waitFor(() => {
      // Sprawdzenie powitania z imieniem użytkownika
      expect(screen.getByText('Witaj, Jan')).toBeInTheDocument();
      
      // Sprawdzenie postępu uzupełnienia profilu
      expect(screen.getByText('60% ukończono')).toBeInTheDocument();
      
      // Sprawdzenie daty urodzenia w kafelku profilu
      expect(screen.getByText('1990-01-01')).toBeInTheDocument();
    });
  });

  test('wyświetla aktualny rok w stopce', async () => {
    // Mock dla currentYear
    const currentYear = new Date().getFullYear();
    
    render(<Dashboard />);
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      // Sprawdzenie czy rok jest poprawnie wyświetlany w stopce
      const footerText = screen.getByText(new RegExp(`${currentYear} Twoja Przepowiednia`, 'i'));
      expect(footerText).toBeInTheDocument();
    });
  });
});