// src/mocks/jest-setup.ts
// Dodaj ten plik do setupFilesAfterEnv w konfiguracji Jest

import { server } from './server';

// Uruchamiamy serwer przed wszystkimi testami
beforeAll(() => server.listen());

// Resetujemy handlery po każdym teście, dzięki czemu testy są izolowane
afterEach(() => server.resetHandlers());

// Zamykamy serwer po wszystkich testach
afterAll(() => server.close());