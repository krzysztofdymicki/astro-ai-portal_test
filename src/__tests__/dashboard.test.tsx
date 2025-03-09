// src/__tests__/dashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../app/dashboard/page';
import { toast } from 'sonner';
import * as supabaseClient from '../utils/supabase/client';
import { mockCreateClient, mockSupabaseClient } from '../utils/test-utils';

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
  });

  test('renderuje dashboard z prawidłowymi elementami UI', () => {
    render(<Dashboard />);
    
    // Sprawdzenie czy główne elementy interfejsu są wyświetlane
    expect(screen.getByText(/twoja przepowiednia/i)).toBeInTheDocument();
    expect(screen.getByText(/panel użytkownika/i)).toBeInTheDocument();
    expect(screen.getByText(/twoje osobiste centrum astrologiczne/i)).toBeInTheDocument();
    expect(screen.getByText(/strona w budowie/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wyloguj się/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sprawdź swój horoskop/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /powrót na stronę główną/i })).toBeInTheDocument();
    
    // Sprawdzenie czy tło kosmiczne jest wyrenderowane
    expect(screen.getByTestId('cosmic-background')).toBeInTheDocument();
  });

  test('obsługuje wylogowanie użytkownika', async () => {
    // Ustawienie mocka dla pomyślnego wylogowania
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    render(<Dashboard />);
    
    // Kliknięcie przycisku wylogowania
    fireEvent.click(screen.getByRole('button', { name: /wyloguj się/i }));
    
    // Oczekiwanie na zakończenie procesu wylogowania
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Wylogowano pomyślnie");
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('wyświetla błąd dla nieudanego wylogowania', async () => {
    // Ustawienie mocka dla nieudanego wylogowania
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: { message: 'Failed to sign out' },
    });

    render(<Dashboard />);
    
    // Kliknięcie przycisku wylogowania
    fireEvent.click(screen.getByRole('button', { name: /wyloguj się/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Błąd wylogowania", {
        description: "Failed to sign out"
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  test('obsługuje kliknięcie przycisku sprawdź swój horoskop', () => {
    render(<Dashboard />);
    
    // Kliknięcie przycisku sprawdź swój horoskop
    fireEvent.click(screen.getByRole('button', { name: /sprawdź swój horoskop/i }));
    
    // Sprawdzenie czy toast informacyjny został wyświetlony
    expect(toast.info).toHaveBeenCalledWith("Ta funkcja będzie dostępna wkrótce!");
  });

  test('sprawdza czy link powrót na stronę główną ma odpowiedni href', () => {
    render(<Dashboard />);
    
    // Pobranie linku i sprawdzenie href
    const homeLink = screen.getByRole('link', { name: /powrót na stronę główną/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('wyświetla aktualny rok w stopce', () => {
    // Mockowanie Date.getFullYear()
    const mockDate = new Date(2023, 0, 1);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    render(<Dashboard />);
    
    // Sprawdzenie czy rok jest poprawnie wyświetlany w stopce
    expect(screen.getByText(/2023 twoja przepowiednia\. wszystkie prawa zastrzeżone\./i)).toBeInTheDocument();
    
    // Przywrócenie oryginalnej implementacji Date
    jest.restoreAllMocks();
  });

  test('przyciski są domyślnie włączone', () => {
    render(<Dashboard />);
    
    // Sprawdzenie czy przyciski są domyślnie aktywne
    expect(screen.getByRole('button', { name: /wyloguj się/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /sprawdź swój horoskop/i })).not.toBeDisabled();
  });

  test('przycisk wyloguj się jest wyłączony podczas procesu wylogowywania', async () => {
    // Opóźnienie mocka wylogowania, aby sprawdzić stan ładowania
    mockSupabaseClient.auth.signOut.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ error: null });
        }, 100);
      });
    });

    render(<Dashboard />);
    
    // Kliknięcie przycisku wylogowania
    fireEvent.click(screen.getByRole('button', { name: /wyloguj się/i }));
    
    // Sprawdzenie czy przycisk ma stan ładowania i jest wyłączony
    expect(screen.getByRole('button', { name: /wylogowywanie\.\.\./i })).toBeDisabled();
    
    // Oczekiwanie na zakończenie procesu wylogowania
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Wylogowano pomyślnie");
    });
  });
});