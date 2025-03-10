import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import HomePage from '../app/page';
import { UserProvider } from '../contexts/UserContext';

// Mock dla komponentu CosmicBackground
jest.mock('../components/background/CosmicBackground', () => ({
  __esModule: true,
  default: () => <div data-testid="cosmic-background" />
}));

// If you need to mock any function used by the HomePage component
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '/',
    };
  },
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    // Render the component with required providers before each test
    render(
      <UserProvider>
        <HomePage />
      </UserProvider>
    );
  });

  test('renders the main page sections', () => {
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders main heading and subheading', () => {
    expect(screen.getByTestId('main-heading')).toBeInTheDocument();
    expect(screen.getByTestId('main-heading').textContent).toBe('Twoja Przepowiednia');
    expect(screen.getByTestId('main-subheading')).toBeInTheDocument();
  });

  test('renders all feature cards', () => {
    expect(screen.getByTestId('features-grid')).toBeInTheDocument();
    expect(screen.getByTestId('feature-experience')).toBeInTheDocument();
    expect(screen.getByTestId('feature-clients')).toBeInTheDocument();
    expect(screen.getByTestId('feature-accuracy')).toBeInTheDocument();
  });

  test('renders testimonials section with client opinions', () => {
    expect(screen.getByTestId('testimonials-heading')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-1')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-2')).toBeInTheDocument();
  });

  test('renders login and register buttons with correct links', () => {
    const loginButton = screen.getByTestId('login-button');
    const registerButton = screen.getByTestId('register-button');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
    
    expect(loginButton.getAttribute('href')).toBe('/login');
    expect(registerButton.getAttribute('href')).toBe('/register');
  });

  test('renders CTA section with register button', () => {
    const ctaButton = screen.getByTestId('cta-button');
    
    expect(screen.getByTestId('cta-heading')).toBeInTheDocument();
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.getAttribute('href')).toBe('/register');
  });

  // Isolating this test since it needs its own render with a mocked Date
  describe('Footer copyright', () => {
    test('displays current year in footer copyright', () => {
      // Clean up previous render to avoid conflicts
      cleanup();
      
      // Better way to mock Date
      const RealDate = global.Date;
      const mockDate = new Date(2025, 2, 10);
      
      // Mock implementation that returns our fixed date for new Date()
      global.Date = class extends RealDate {
        constructor() {
          super();
          return mockDate;
        }
        
        static now() {
          return mockDate.getTime();
        }
      } as DateConstructor;
      
      // Render with mocked date
      render(
        <UserProvider>
          <HomePage />
        </UserProvider>
      );
      
      expect(screen.getByTestId('footer').textContent).toContain('2025');
      
      // Cleanup - restore the real Date implementation
      global.Date = RealDate;
    });
  });
});