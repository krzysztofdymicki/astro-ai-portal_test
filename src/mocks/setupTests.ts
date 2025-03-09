// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Konfiguracja i czyszczenie MSW przed/po testach
beforeAll(() => {
  // Uruchomienie mockowanego serwera
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset wszystkich handlerów między testami
  server.resetHandlers();
});

afterAll(() => {
  // Zamknięcie serwera po zakończeniu testów
  server.close();
});