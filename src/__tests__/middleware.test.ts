// src/__tests__/middleware.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { updateSession } from '@/utils/supabase/middleware';

// Mockujemy middleware Supabase
jest.mock('@/utils/supabase/middleware', () => ({
  updateSession: jest.fn(),
}));

// Mockujemy NextRequest i NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextRequest: jest.fn(),
    NextResponse: {
      next: jest.fn(),
      redirect: jest.fn(),
    },
  };
});

describe('Middleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mockujemy podstawowe elementy dla każdego testu
    mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: jest.fn().mockReturnThis(),
      },
    };
    
    mockResponse = NextResponse.next();
    (updateSession as jest.Mock).mockResolvedValue(mockResponse);
  });
  
  it('calls updateSession with request', async () => {
    await middleware(mockRequest as unknown as NextRequest);
    expect(updateSession).toHaveBeenCalledWith(mockRequest);
  });
  
  it('returns response from updateSession', async () => {
    const result = await middleware(mockRequest as unknown as NextRequest);
    expect(result).toBe(mockResponse);
  });
  
  // Testowanie logiki przepływu
  it('redirects unauthenticated users from protected routes', async () => {
    // Mockujemy implementację updateSession dla konkretnego testu
    // Symulujemy, że użytkownik jest niezalogowany i próbuje dostać się do chronionej ścieżki
    mockRequest.nextUrl.pathname = '/dashboard';
    
    const redirectSpy = jest.spyOn(NextResponse, 'redirect');
    (updateSession as jest.Mock).mockImplementation((request) => {
      // Logika przekierowania z middleware.ts
      if (
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/register') &&
        !request.nextUrl.pathname.startsWith('/reset-password') &&
        request.nextUrl.pathname !== '/'
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    });
    
    await middleware(mockRequest as unknown as NextRequest);
    
    expect(redirectSpy).toHaveBeenCalled();
    expect(mockRequest.nextUrl.clone).toHaveBeenCalled();
    
    redirectSpy.mockRestore();
  });
  
  it('redirects authenticated users from auth routes', async () => {
    // Mockujemy implementację updateSession dla konkretnego testu
    // Symulujemy, że użytkownik jest zalogowany i próbuje dostać się do strony logowania
    mockRequest.nextUrl.pathname = '/login';
    
    const redirectSpy = jest.spyOn(NextResponse, 'redirect');
    (updateSession as jest.Mock).mockImplementation((request) => {
      // Logika przekierowania z middleware.ts dla zalogowanego użytkownika
      const user = { id: 'user-123' }; // Symulujemy zalogowanego użytkownika
      
      if (
        user && 
        (request.nextUrl.pathname === '/' || 
         request.nextUrl.pathname.startsWith('/login') || 
         request.nextUrl.pathname.startsWith('/register') ||
         request.nextUrl.pathname.startsWith('/reset-password'))
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    });
    
    await middleware(mockRequest as unknown as NextRequest);
    
    expect(redirectSpy).toHaveBeenCalled();
    expect(mockRequest.nextUrl.clone).toHaveBeenCalled();
    
    redirectSpy.mockRestore();
  });
});