// src/__tests__/dashboard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../app/dashboard/page';
import * as supabaseClient from '../utils/supabase/client';
import { mockCreateClient, mockSupabaseClient } from '../utils/test-utils';
import { UserProvider } from '../contexts/UserContext'; // Import UserProvider

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
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    );
    
    // Czekamy na załadowanie komponentu i sprawdzamy jego podstawowe elementy
    await waitFor(() => {
      // Sprawdzenie czy główny kontener dashboardu jest renderowany
      expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      
      // Sprawdzenie czy kafelki są renderowane
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('questions-card')).toBeInTheDocument();
      expect(screen.getByTestId('horoscopes-card')).toBeInTheDocument();
      
      // Sprawdzenie czy cytat jest renderowany
      expect(screen.getByTestId('quote-container')).toBeInTheDocument();
    });
  });

  test('przekierowuje do strony profilu po kliknięciu "Uzupełnij profil"', async () => {
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    );
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByTestId('profile-button')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const profileLink = screen.getByTestId('profile-link');
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile');
  });

  test('przekierowuje do strony pytań po kliknięciu "Odpowiedz na pytania"', async () => {
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    );
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByTestId('questions-button')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const questionsLink = screen.getByTestId('questions-link');
    expect(questionsLink).toHaveAttribute('href', '/dashboard/questions');
  });

  test('przekierowuje do strony horoskopów po kliknięciu "Przeglądaj horoskopy"', async () => {
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    );
    
    // Czekamy na załadowanie komponentu
    await waitFor(() => {
      expect(screen.getByTestId('horoscopes-button')).toBeInTheDocument();
    });
    
    // Sprawdzamy, czy link prowadzi do prawidłowej ścieżki
    const horoscopesLink = screen.getByTestId('horoscopes-link');
    expect(horoscopesLink).toHaveAttribute('href', '/dashboard/horoscopes');
  });

  test('wyświetla prawidłowe dane profilu użytkownika', async () => {
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    );
    
    // Czekamy na załadowanie danych użytkownika
    await waitFor(() => {
      // Sprawdzenie czy nagłówek z powitaniem zawiera imię użytkownika
      const welcomeHeading = screen.getByTestId('welcome-heading');
      expect(welcomeHeading.textContent).toContain('Jan');
      
      // Sprawdzenie postępu uzupełnienia profilu
      const progressPercentage = screen.getByTestId('profile-completion-percentage');
      expect(progressPercentage.textContent).toBe('60%');
      
      // Sprawdzenie czy pasek postępu ma odpowiednią szerokość
      const progressBar = screen.getByTestId('profile-progress-bar');
      expect(progressBar).toHaveStyle('width: 60%');
    });
  });

  // Usuwamy test dotyczący roku w stopce, ponieważ stopka jest teraz w komponencie layout
  // To by było bardziej odpowiednie w teście dla komponentu layout
});