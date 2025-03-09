// src/__tests__/login.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Login from '../app/(auth)/login/page';
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
  },
}));

jest.mock('../utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('Login Component', () => {
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

  test('renderuje formularz logowania', () => {
    render(<Login />);
    
    // Użyj data-testid zamiast getByLabelText
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByText(/zapomniałeś hasła/i)).toBeInTheDocument();
    expect(screen.getByText(/nie masz jeszcze konta/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zarejestruj się/i })).toBeInTheDocument();
  });

  test('wyświetla błędy walidacji przy pustych polach', async () => {
    render(<Login />);
    
    // Symulujemy błąd walidacji formularza (preventDefault i stopPropagation nie działają w testach)
    const form = screen.getByRole('form', { name: /login-form/i });
    fireEvent.submit(form);
    
    // Dodajemy jawne wywołanie funkcji walidacji
    jest.runAllTimers(); // Jeśli używasz setTimeout w walidacji
    
    // Sprawdzenie czy toast z błędem został wywołany
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('pomyślne logowanie przekierowuje na dashboard', async () => {
    // Ustawienie mocka dla pomyślnego logowania
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { 
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com' 
        } 
      },
      error: null,
    });

    render(<Login />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    
    // Kliknięcie przycisku logowania
    fireEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu sukcesu
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(toast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('wyświetla błąd dla nieprawidłowych danych logowania', async () => {
    // Ustawienie mocka dla niepomyślnego logowania
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    render(<Login />);
    
    // Wypełnienie formularza używając getByTestId zamiast getByLabelText
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'wrong_password' },
    });
    
    // Kliknięcie przycisku logowania
    fireEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));
    
    // Oczekiwanie na zakończenie procesu logowania z dłuższym timeoutem
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrong_password',
      });
    }, { timeout: 3000 });
    
    // Oddzielne oczekiwanie na komunikat błędu
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Błąd logowania", 
        expect.objectContaining({
          description: expect.stringContaining("Nieprawidłowy email lub hasło")
        })
      );
      expect(mockPush).not.toHaveBeenCalled();
    }, { timeout: 3000 });
  }); 

  test('obsługuje reset hasła', async () => {
    // Ustawienie mocka dla resetowania hasła
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    });

    render(<Login />);
    
    // Wypełnienie pola email używając getByTestId
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    // Kliknięcie przycisku reset hasła
    fireEvent.click(screen.getByText(/zapomniałeś hasła/i));
    
    // Oczekiwanie na zakończenie procesu resetowania
    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password")
        })
      );
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Link do resetowania hasła wysłany", 
        expect.objectContaining({
          description: expect.any(String)
        })
      );
    }, { timeout: 3000 });
  });

  test('obsługuje błąd resetowania hasła gdy email jest pusty', async () => {
    render(<Login />);
    
    // Pozostawiamy pole email puste
    
    // Kliknięcie przycisku reset hasła
    fireEvent.click(screen.getByText(/zapomniałeś hasła/i));
    
    // Oczekiwanie na komunikat o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Wprowadź adres email", expect.anything());
      expect(mockSupabaseClient.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });
  });

  test('pokazuje/ukrywa hasło po kliknięciu ikony oka', () => {
    render(<Login />);
    
    const passwordInput = screen.getByTestId('password-input');
    
    // Sprawdzenie czy pole hasła ma domyślnie typ "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Kliknięcie przycisku pokaż hasło
    fireEvent.click(screen.getByRole('button', { name: /pokaż hasło/i }));
    
    // Sprawdzenie czy pole hasła ma teraz typ "text"
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Ponowne kliknięcie przycisku ukryj hasło
    fireEvent.click(screen.getByRole('button', { name: /ukryj hasło/i }));
    
    // Sprawdzenie czy pole hasła ma znów typ "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});