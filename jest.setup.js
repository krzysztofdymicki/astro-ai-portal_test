// jest.setup.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextDecoder, TextEncoder } from 'util';

// Ustawienie zmiennych środowiskowych dla testów
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Zapewnienie, że TextEncoder i TextDecoder są dostępne globalnie
Object.assign(global, { TextDecoder, TextEncoder });

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock dla sonner (system toastów)
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock dla window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { origin: 'http://localhost:3000' },
});

// Wyciszenie warningów konsolowych podczas testów
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render') ||
    args[0].includes('Warning: React.createFactory') ||
    args[0].includes('Warning: Using UNSAFE_') ||
    args[0].includes('Warning: You provided a `checked` prop to a form field')
  ) {
    return;
  }
  originalConsoleError(...args);
};