// src/__tests__/CosmicBackground.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CosmicBackground from '../components/background/CosmicBackground';

// Mock dla canvas context
const mockGetContext = jest.fn();
const mockClearRect = jest.fn();
const mockFillRect = jest.fn();
const mockBeginPath = jest.fn();
const mockArc = jest.fn();
const mockFill = jest.fn();
const mockCreateLinearGradient = jest.fn();
const mockCreateRadialGradient = jest.fn();
const mockAddColorStop = jest.fn();
const mockFillStyle = jest.fn();
const mockMoveTo = jest.fn();
const mockLineTo = jest.fn();
const mockStrokeStyle = jest.fn();
const mockLineWidth = jest.fn();
const mockStroke = jest.fn();
const mockSave = jest.fn();
const mockRestore = jest.fn();

// Mock dla requestAnimationFrame i cancelAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  callback(0);
  return 0;
});

global.cancelAnimationFrame = jest.fn();

describe('CosmicBackground Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mockowanie wymiarów okna
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });
    
    // Mockowanie canvas API
    const gradientMock = {
      addColorStop: mockAddColorStop,
    };
    
    mockCreateLinearGradient.mockReturnValue(gradientMock);
    mockCreateRadialGradient.mockReturnValue(gradientMock);
    
    HTMLCanvasElement.prototype.getContext = mockGetContext.mockReturnValue({
      clearRect: mockClearRect,
      fillRect: mockFillRect,
      beginPath: mockBeginPath,
      arc: mockArc,
      fill: mockFill,
      createLinearGradient: mockCreateLinearGradient,
      createRadialGradient: mockCreateRadialGradient,
      moveTo: mockMoveTo,
      lineTo: mockLineTo,
      stroke: mockStroke,
      save: mockSave,
      restore: mockRestore,
      set fillStyle(value) {},
      get fillStyle() { return ''; },
      set strokeStyle(value) {},
      get strokeStyle() { return ''; },
      set lineWidth(value) {},
      get lineWidth() { return 1; },
    });
  });

  test('renderuje canvas element', () => {
    render(<CosmicBackground />);
    
    // Sprawdzenie czy canvas jest wyrenderowany
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
    
    // Sprawdzenie klasy CSS
    expect(canvas).toHaveClass('fixed');
    expect(canvas).toHaveClass('-z-10');
    
    // Sprawdzenie style
    expect(canvas).toHaveStyle({ pointerEvents: 'none' });
  });

  test('inicjalizuje canvas context', () => {
    render(<CosmicBackground />);
    
    // Sprawdzenie czy getContext zostało wywołane z "2d"
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  test('ustawia wymiary canvas na wymiary okna', () => {
    render(<CosmicBackground />);
    
    // Pobranie elementu canvas
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    
    // Sprawdzenie czy wymiary canvas są ustawione na wymiary okna
    expect(canvas.width).toBe(1024);
    expect(canvas.height).toBe(768);
  });

  test('rozpoczyna animację przy renderowaniu', () => {
    render(<CosmicBackground />);
    
    // Sprawdzenie czy requestAnimationFrame zostało wywołane
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  test('czyści animację przy odmontowaniu', () => {
    const { unmount } = render(<CosmicBackground />);
    
    // Wywołanie unmount
    unmount();
    
    // Sprawdzenie czy cancelAnimationFrame zostało wywołane
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  test('obsługuje resize okna', () => {
    render(<CosmicBackground />);
    
    // Symulacja zdarzenia resize
    window.dispatchEvent(new Event('resize'));
    
    // Sprawdzenie czy wymiary canvas są ponownie ustawiane
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    expect(canvas.width).toBe(1024);
    expect(canvas.height).toBe(768);
  });

  test('usuwa event listener resize przy odmontowaniu', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<CosmicBackground />);
    
    // Wywołanie unmount
    unmount();
    
    // Sprawdzenie czy removeEventListener zostało wywołane z 'resize'
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    // Przywrócenie oryginalnej implementacji
    removeEventListenerSpy.mockRestore();
  });
});