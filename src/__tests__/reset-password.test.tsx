// src/__tests__/reset-password.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ResetPassword from '../app/(auth)/reset-password/page';
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

describe('ResetPassword Component', () => {
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
    
    // Mockowanie location.hash dla symulacji prawidłowego linku resetowania
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        hash: '#access_token=123&type=recovery',
        origin: 'http://localhost:3000'
      },
    });
  });

  test('renderuje formularz resetowania hasła', () => {
    render(<ResetPassword />);
    
    // Sprawdzenie czy podstawowe elementy formularza są wyświetlane
    expect(screen.getByRole('heading', { name: /ustaw nowe hasło/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nowe hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potwierdź nowe hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ustaw nowe hasło/i })).toBeInTheDocument();
    expect(screen.getByText(/pamiętasz swoje hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument();
  });

  test('wyświetla błąd gdy brakuje tokenu resetowania w URL', () => {
    // Ustawienie pustego hash w URL
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { 
        hash: '',
        origin: 'http://localhost:3000'
      },
    });

    render(<ResetPassword />);
    
    // Sprawdzenie czy wyświetlono komunikat o błędzie
    expect(toast.error).toHaveBeenCalledWith(
      "Nieprawidłowy link resetowania hasła",
      expect.objectContaining({
        description: expect.stringContaining("Użyj linku otrzymanego")
      })
    );
  });

  test('wyświetla błędy walidacji przy pustych polach', async () => {
    render(<ResetPassword />);
    
    // Kliknięcie przycisku resetowania bez wypełniania pól
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na wyświetlenie komunikatów o błędach
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Hasło musi zawierać co najmniej 6 znaków");
    });
  });

  test('wyświetla błąd gdy hasła nie są identyczne', async () => {
    render(<ResetPassword />);
    
    // Wypełnienie formularza z różnymi hasłami
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'password456' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Hasła nie są identyczne");
    });
  });

  test('wyświetla błąd gdy hasło jest za krótkie', async () => {
    render(<ResetPassword />);
    
    // Wypełnienie formularza z za krótkim hasłem
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'pass' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'pass' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Hasło musi zawierać co najmniej 6 znaków");
    });
  });

  test('pomyślne resetowanie hasła wyświetla komunikat sukcesu', async () => {
    // Ustawienie mocka dla pomyślnego resetowania hasła
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<ResetPassword />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na zakończenie procesu resetowania
    await waitFor(() => {
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ 
        password: 'newpassword123' 
      });
      expect(toast.success).toHaveBeenCalledWith("Hasło zostało zmienione", expect.anything());
    });
  });

  test('wyświetla błąd dla nieudanego resetowania hasła', async () => {
    // Ustawienie mocka dla nieudanego resetowania hasła
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid reset token' },
    });

    render(<ResetPassword />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ 
        password: 'newpassword123' 
      });
      expect(toast.error).toHaveBeenCalledWith("Błąd resetowania hasła", {
        description: "Invalid reset token"
      });
    });
  });

  test('po resetowaniu hasła wyświetla widok potwierdzenia', async () => {
    // Ustawienie mocka dla pomyślnego resetowania hasła
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<ResetPassword />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na przejście do widoku potwierdzenia
    await waitFor(() => {
      expect(screen.getByText(/hasło zostało zmienione/i)).toBeInTheDocument();
      expect(screen.getByText(/twoje hasło zostało pomyślnie zaktualizowane/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /przejdź do logowania/i })).toBeInTheDocument();
    });
  });

  test('obsługuje przejście do logowania po resetowaniu hasła', async () => {
    // Ustawienie mocka dla pomyślnego resetowania hasła
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<ResetPassword />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź nowe hasło/i), {
      target: { value: 'newpassword123' },
    });
    
    // Kliknięcie przycisku resetowania
    fireEvent.click(screen.getByRole('button', { name: /ustaw nowe hasło/i }));
    
    // Oczekiwanie na przejście do widoku potwierdzenia
    await waitFor(() => {
      expect(screen.getByText(/hasło zostało zmienione/i)).toBeInTheDocument();
    });
    
    // Kliknięcie przycisku przejścia do logowania
    fireEvent.click(screen.getByRole('button', { name: /przejdź do logowania/i }));
    
    // Sprawdzenie czy nastąpiło przekierowanie
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  test('pokazuje/ukrywa hasło po kliknięciu ikony oka', () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/nowe hasło/i);
    
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