// src/mocks/server.ts (dla testów jednostkowych/integracyjnych)
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);