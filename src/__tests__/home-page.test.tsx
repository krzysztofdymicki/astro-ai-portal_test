// src/__tests__/home-page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

// Mock dla komponentu CosmicBackground
jest.mock('../components/background/CosmicBackground', () => ({
  __esModule: true,
  default: () => <div data-testid="cosmic-background" />
}));

describe('HomePage Component', () => {
  test('renderuje stronę główną z prawidłowymi elementami', () => {
    render(<HomePage />);
    
    // Sprawdzenie nagłówków i tekstów
    expect(screen.getByText(/twoja przepowiednia/i)).toBeInTheDocument();
    expect(screen.getByText(/odkryj swoją przyszłość/i)).toBeInTheDocument();
    expect(screen.getByText(/z pomocą doświadczonych astrologów/i)).toBeInTheDocument();
    expect(screen.getByText(/personalizowane horoskopy/i)).toBeInTheDocument();
    
    // Sprawdzenie przycisków i linków
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zarejestruj się/i, exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /rozpocznij za darmo/i })).toBeInTheDocument();
    
    // Sprawdzenie sekcji zalet
    expect(screen.getByText(/dlaczego nasi klienci nam ufają/i)).toBeInTheDocument();
    expect(screen.getByText(/15\+/i)).toBeInTheDocument();
    expect(screen.getByText(/lat doświadczenia/i)).toBeInTheDocument();
    expect(screen.getByText(/10 000\+/i)).toBeInTheDocument();
    expect(screen.getByText(/zadowolonych klientów/i)).toBeInTheDocument();
    expect(screen.getByText(/ponad 90%/i)).toBeInTheDocument();
    expect(screen.getByText(/trafność/i)).toBeInTheDocument();
    
    // Sprawdzenie sekcji świadectw
    expect(screen.getByText(/co mówią nasi klienci/i)).toBeInTheDocument();
    expect(screen.getByText(/- anna k\., warszawa/i)).toBeInTheDocument();
    expect(screen.getByText(/- marek w\., kraków/i)).toBeInTheDocument();
    
    // Sprawdzenie czy tło kosmiczne jest wyrenderowane
    expect(screen.getByTestId('cosmic-background')).toBeInTheDocument();
  });

  test('linki mają odpowiednie adresy URL', () => {
    render(<HomePage />);
    
    // Sprawdzenie URL dla linków logowania i rejestracji
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: /zarejestruj się/i })[0]).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /rozpocznij za darmo/i })).toHaveAttribute('href', '/register');
  });

  test('wyświetla aktualny rok w stopce', () => {
    // Mockowanie Date.getFullYear()
    const mockDate = new Date(2023, 0, 1);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
    
    render(<HomePage />);
    
    // Sprawdzenie czy rok jest poprawnie wyświetlany w stopce
    expect(screen.getByText(/2023 twoja przepowiednia\. wszystkie prawa zastrzeżone\./i)).toBeInTheDocument();
    
    // Przywrócenie oryginalnej implementacji Date
    jest.restoreAllMocks();
  });
});