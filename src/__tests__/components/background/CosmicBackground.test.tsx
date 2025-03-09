// src/__tests__/components/background/CosmicBackground.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import CosmicBackground from '@/components/background/CosmicBackground';

// Jest już ma mockowany Canvas w setup

describe('CosmicBackground Component', () => {
  it('renders canvas element correctly', () => {
    const { container } = render(<CosmicBackground />);
    const canvas = container.querySelector('canvas');
    
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('fixed');
    expect(canvas).toHaveClass('-z-10');
    expect(canvas).toHaveStyle({ pointerEvents: 'none' });
  });
  
  it('sets up resize event listener', () => {
    // Mockujemy addEventListener i sprawdzamy czy został wywołany z 'resize'
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    
    render(<CosmicBackground />);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    // Przywracamy oryginalną implementację
    addEventListenerSpy.mockRestore();
  });
  
  it('cleans up event listeners on unmount', () => {
    // Mockujemy removeEventListener i sprawdzamy czy został wywołany z 'resize'
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<CosmicBackground />);
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    // Przywracamy oryginalną implementację
    removeEventListenerSpy.mockRestore();
  });
  
  it('cancels animation frame on unmount', () => {
    // Mockujemy cancelAnimationFrame
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    
    const { unmount } = render(<CosmicBackground />);
    
    // Wywołujemy animację
    jest.advanceTimersByTime(100);
    
    unmount();
    
    // cancelAnimationFrame powinien być wywołany przy odmontowaniu
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    
    // Przywracamy oryginalną implementację
    cancelAnimationFrameSpy.mockRestore();
  });
});