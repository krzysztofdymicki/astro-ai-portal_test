// src/__tests__/home-page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';
import { getHeadingByText, getParagraphByText, renderWithLayout } from '../utils/test-utils';

// Mock dla komponentu CosmicBackground
jest.mock('../components/background/CosmicBackground', () => ({
  __esModule: true,
  default: () => <div data-testid="cosmic-background" />
}));

describe('HomePage Component', () => {
  test('renderuje stronę główną z prawidłowymi elementami', () => {
    render(<HomePage />);
    
    // Użyj bardziej specyficznych selektorów
    expect(getHeadingByText(/twoja przepowiednia/i)).toBeInTheDocument();
    expect(screen.getByText(/odkryj swoją przyszłość/i)).toBeInTheDocument();
    expect(screen.getByText(/z pomocą doświadczonych astrologów/i)).toBeInTheDocument();
    expect(screen.getByText(/personalizowane horoskopy/i)).toBeInTheDocument();
    
    // Sprawdzenie przycisków i linków
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zarejestruj się/i })).toBeInTheDocument();
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
  });

  test('linki mają odpowiednie adresy URL', () => {
    render(<HomePage />);
    
    // Sprawdzenie URL dla linków logowania i rejestracji
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: /zarejestruj się/i })[0]).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /rozpocznij za darmo/i })).toHaveAttribute('href', '/register');
  });

  test('wyświetla aktualny rok w stopce', () => {
    // Poprawione mockowanie Date
    const originalDate = global.Date;
    const mockDate = new Date(2023, 0, 1);
    
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() { return mockDate.getTime(); }
    } as DateConstructor;
    
    render(<HomePage />);
    
    // Użyj bardziej specyficznego selektora dla stopki
    const footerText = screen.getByText((content) => {
      return content.includes('2023 Twoja Przepowiednia');
    });
    expect(footerText).toBeInTheDocument();
    
    // Przywracanie prawdziwego Date
    global.Date = originalDate;
  });
});

describe('HomePage Component with Layout', () => {
  test('renderuje stronę główną z layoutem', () => {
    renderWithLayout(<HomePage />);
    
    // Now you can test for layout components
    expect(screen.getByTestId('cosmic-background')).toBeInTheDocument();
  });
});