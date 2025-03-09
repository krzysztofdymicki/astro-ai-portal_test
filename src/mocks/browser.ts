// src/mocks/browser.ts (dla testów w przeglądarce, np. w Cypress)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);