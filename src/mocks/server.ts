// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Tworzenie serwera MSW z handlerem
export const server = setupServer(...handlers);