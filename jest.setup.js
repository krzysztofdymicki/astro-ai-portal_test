// jest.setup.js
import '@testing-library/jest-dom';

// Globalny mock dla next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => ''),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

// Mock dla window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // przestarzałe
    removeListener: jest.fn(), // przestarzałe
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mockowanie requestAnimationFrame
global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
  return 0;
};

// Mockowanie cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mockowanie funkcji canvas, które mogą być używane w tle kosmicznym
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  strokeStyle: '',
  lineWidth: 0,
  save: jest.fn(),
  restore: jest.fn(),
}));

// Reset wszystkich mocków po każdym teście
afterEach(() => {
  jest.clearAllMocks();
});