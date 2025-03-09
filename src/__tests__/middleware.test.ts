// src/__tests__/middleware.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import * as supabaseMiddleware from '../utils/supabase/middleware';

// Mock modułów
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

jest.mock('../utils/supabase/middleware', () => ({
  updateSession: jest.fn(),
}));

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('wywołuje updateSession z request', async () => {
    // Mockowanie request
    const mockRequest = { url: 'http://localhost:3000/dashboard' } as unknown as NextRequest;
    
    // Mockowanie odpowiedzi z updateSession
    const mockNextResponse = { status: 200 } as unknown as NextResponse;
    (supabaseMiddleware.updateSession as jest.Mock).mockResolvedValue(mockNextResponse);
    
    // Wywołanie middleware
    const response = await middleware(mockRequest);
    
    // Sprawdzenie czy updateSession zostało wywołane z request
    expect(supabaseMiddleware.updateSession).toHaveBeenCalledWith(mockRequest);
    
    // Sprawdzenie czy middleware zwraca odpowiedź z updateSession
    expect(response).toEqual(mockNextResponse);
  });

  test('przekazuje błędy z updateSession', async () => {
    // Mockowanie request
    const mockRequest = { url: 'http://localhost:3000/dashboard' } as unknown as NextRequest;
    
    // Mockowanie błędu z updateSession
    const mockError = new Error('Session error');
    (supabaseMiddleware.updateSession as jest.Mock).mockRejectedValue(mockError);
    
    // Wywołanie middleware powinno zwrócić błąd
    await expect(middleware(mockRequest)).rejects.toThrow('Session error');
  });
});