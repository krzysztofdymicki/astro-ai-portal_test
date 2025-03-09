// src/__tests__/app/login.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoginPage from '@/app/(auth)/login/page';

// Mockujemy sonner (biblioteka toastów)
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mockujemy Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  })),
}));

// Mockujemy useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Login Page', () => {
  let mockRouter: { push: jest.Mock };
  let mockSignInWithPassword: jest.Mock;
  let mockResetPasswordForEmail: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Konfigurujemy mocki
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    const { createClient } = require('@/utils/supabase/client');
    mockSignInWithPassword = jest.fn();
    mockResetPasswordForEmail = jest.fn();
    
    createClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    });
  });
  
  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zarejestruj się/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zapomniałeś hasła/i })).toBeInTheDocument();
  });
  
  it('validates form fields on submission', async () => {
    render(<LoginPage />);
    
    // Próba wysłania pustego formularza
    await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));
    
    // Sprawdzamy czy zostały wyświetlone komunikaty o błędach
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Nieprawidłowy adres email'));
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
  
  it('handles successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    
    render(<LoginPage />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/hasło/i), 'password123');
    
    // Wysyłamy formularz
    await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));
    
    // Sprawdzamy czy została wywołana odpowiednia akcja
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Sprawdzamy czy wyświetlony został komunikat o sukcesie
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie', expect.anything());
    });
    
    // Sprawdzamy czy nastąpiło przekierowanie
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
  
  it('handles login error', async () => {
    mockSignInWithPassword.mockResolvedValue({ 
      error: { message: 'Invalid login credentials' } 
    });
    
    render(<LoginPage />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/hasło/i), 'wrong-password');
    
    // Wysyłamy formularz
    await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));
    
    // Sprawdzamy czy została wywołana odpowiednia akcja
    expect(mockSignInWithPassword).toHaveBeenCalled();
    
    // Sprawdzamy czy wyświetlony został komunikat o błędzie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Błąd logowania', expect.anything());
    });
    
    // Nie powinno nastąpić przekierowanie
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
  
  it('handles password reset request', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    
    render(<LoginPage />);
    
    // Wypełniamy tylko pole email
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    // Klikamy przycisk resetowania hasła
    await userEvent.click(screen.getByRole('button', { name: /zapomniałeś hasła/i }));
    
    // Sprawdzamy czy została wywołana odpowiednia akcja
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', expect.anything());
    
    // Sprawdzamy czy wyświetlony został komunikat o sukcesie
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Link do resetowania hasła wysłany', expect.anything());
    });
  });
  
  it('shows error when trying to reset password without email', async () => {
    render(<LoginPage />);
    
    // Klikamy przycisk resetowania hasła bez wypełnienia pola email
    await userEvent.click(screen.getByRole('button', { name: /zapomniałeś hasła/i }));
    
    // Sprawdzamy czy wyświetlony został komunikat o błędzie
    expect(toast.error).toHaveBeenCalledWith('Wprowadź adres email', expect.anything());
    
    // Akcja resetowania nie powinna zostać wywołana
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });
});