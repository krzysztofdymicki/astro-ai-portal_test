// src/__tests__/register.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Register from '../app/(auth)/register/page';
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

describe('Register Component', () => {
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

  test('renderuje formularz rejestracji', () => {
    render(<Register />);
    
    // Sprawdzenie czy podstawowe elementy formularza są wyświetlane
    expect(screen.getByRole('heading', { name: /zarejestruj się/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zarejestruj się/i })).toBeInTheDocument();
    expect(screen.getByText(/masz już konto/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument();
  });

  test('wyświetla błędy walidacji przy pustych polach', async () => {
    render(<Register />);
    
    // Znajdź formularz i wyślij go bezpośrednio
    const form = screen.getByTestId('register-form');
    fireEvent.submit(form);
    
    // Czekaj na DOWOLNY komunikat błędu, bez określania dokładnej treści
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('wyświetla błąd gdy hasła nie są identyczne', async () => {
    render(<Register />);
    
    // Wypełnienie formularza z różnymi hasłami używając testids
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'password456' },
    });
    
    // Kliknięcie przycisku rejestracji
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test('wyświetla błąd gdy hasło jest za krótkie', async () => {
    render(<Register />);
    
    // Wypełnienie formularza z za krótkim hasłem używając testids
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'pass' },
    });
    
    fireEvent.change(screen.getByTestId('confirm-password-input'), {
      target: { value: 'pass' },
    });
    
    // Kliknięcie przycisku rejestracji
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test('pomyślna rejestracja wyświetla komunikat sukcesu', async () => {
    // Ustawienie mocka dla pomyślnej rejestracji
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<Register />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'password123' },
    });
    
    // Kliknięcie przycisku rejestracji
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na zakończenie procesu rejestracji
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('/login'),
        }),
      });
      expect(toast.success).toHaveBeenCalledWith("Rejestracja pomyślna", expect.anything());
    });
  });

  test('wyświetla błąd dla nieudanej rejestracji', async () => {
    // Ustawienie mocka dla nieudanej rejestracji
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    render(<Register />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'password123' },
    });
    
    // Kliknięcie przycisku rejestracji
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'existing@example.com',
        password: 'password123',
        options: expect.anything(),
      });
      expect(toast.error).toHaveBeenCalledWith("Błąd rejestracji", {
        description: "User already registered"
      });
    });
  });

  test('po rejestracji wyświetla widok potwierdzenia', async () => {
    // Ustawienie mocka dla pomyślnej rejestracji
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<Register />);
    
    // Wypełnienie formularza
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'password123' },
    });
    
    // Kliknięcie przycisku rejestracji
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na przejście do widoku potwierdzenia
    await waitFor(() => {
      expect(screen.getByText(/rejestracja zakończona/i)).toBeInTheDocument();
      expect(screen.getByText(/wysłaliśmy link aktywacyjny/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wyślij ponownie link aktywacyjny/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /przejdź do logowania/i })).toBeInTheDocument();
    });
  });

  test('obsługuje ponowne wysłanie linku aktywacyjnego', async () => {
    // Ustawienie mocka dla pomyślnej rejestracji
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });
    
    // Ustawienie mocka dla ponownego wysłania linku
    mockSupabaseClient.auth.resend.mockResolvedValue({
      data: {},
      error: null,
    });

    render(<Register />);
    
    // Wypełnienie formularza i rejestracja
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na przejście do widoku potwierdzenia
    await waitFor(() => {
      expect(screen.getByText(/rejestracja zakończona/i)).toBeInTheDocument();
    });
    
    // Kliknięcie przycisku ponownego wysłania linku
    fireEvent.click(screen.getByRole('button', { name: /wyślij ponownie link aktywacyjny/i }));
    
    // Oczekiwanie na wysłanie linku
    await waitFor(() => {
      expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
      expect(toast.success).toHaveBeenCalledWith("Email wysłany ponownie", expect.anything());
    });
  });

  test('obsługuje przejście do logowania po rejestracji', async () => {
    // Ustawienie mocka dla pomyślnej rejestracji
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    render(<Register />);
    
    // Wypełnienie formularza i rejestracja
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/^hasło$/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    // Oczekiwanie na przejście do widoku potwierdzenia
    await waitFor(() => {
      expect(screen.getByText(/rejestracja zakończona/i)).toBeInTheDocument();
    });
    
    // Kliknięcie przycisku przejścia do logowania
    fireEvent.click(screen.getByRole('button', { name: /przejdź do logowania/i }));
    
    // Sprawdzenie czy nastąpiło przekierowanie
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  test('pokazuje/ukrywa hasło po kliknięciu ikony oka', () => {
    render(<Register />);
    
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    // Sprawdzenie czy pola hasła mają domyślnie typ "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Kliknięcie przycisku pokaż hasło (możemy używać ikony lub data-testid)
    fireEvent.click(screen.getByTestId('toggle-password-visibility'));
    
    // Sprawdzenie czy pola hasła mają teraz typ "text"
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    // Ponowne kliknięcie przycisku ukryj hasło
    fireEvent.click(screen.getByTestId('toggle-password-visibility'));
    
    // Sprawdzenie czy pola hasła mają znów typ "password"
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});