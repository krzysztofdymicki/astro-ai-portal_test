/**
 * Returns a description for the given zodiac element
 */
export function getElementDescription(element: string): string {
  switch (element) {
    case 'Ogień':
      return 'Pasja, energia, entuzjazm';
    case 'Ziemia':
      return 'Stabilność, praktyczność, wytrwałość';
    case 'Powietrze':
      return 'Intelekt, komunikacja, adaptacyjność';
    case 'Woda':
      return 'Emocje, intuicja, wrażliwość';
    default:
      return '';
  }
}

/**
 * Element colors for styling
 */
export const elementColors = {
  'Ogień': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100'
  },
  'Ziemia': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100'
  },
  'Powietrze': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100'
  },
  'Woda': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-100'
  }
};
