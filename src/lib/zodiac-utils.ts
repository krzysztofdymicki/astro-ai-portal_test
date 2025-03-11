// src/lib/zodiac-utils.ts

// Interfejs dla znaku zodiaku
export interface ZodiacInfo {
  id: string;        // ID znaku zodiaku jako string (1, 2, 3, ...)
  name: string;      // Nazwa znaku
  symbol: string;    // Symbol Unicode
  element: string;   // Element (Ogień, Ziemia, Powietrze, Woda)
  startDate: string; // format MM-DD
  endDate: string;   // format MM-DD
}

// Definicje znaków zodiaku
export const ZODIAC_SIGNS: ZodiacInfo[] = [
  {
    id: "1",
    name: 'Baran',
    symbol: '♈',
    element: 'Ogień',
    startDate: '03-21',
    endDate: '04-19'
  },
  {
    id: "2",
    name: 'Byk',
    symbol: '♉',
    element: 'Ziemia',
    startDate: '04-20',
    endDate: '05-20'
  },
  {
    id: "3",
    name: 'Bliźnięta',
    symbol: '♊',
    element: 'Powietrze',
    startDate: '05-21',
    endDate: '06-20'
  },
  {
    id: "4",
    name: 'Rak',
    symbol: '♋',
    element: 'Woda',
    startDate: '06-21',
    endDate: '07-22'
  },
  {
    id: "5",
    name: 'Lew',
    symbol: '♌',
    element: 'Ogień',
    startDate: '07-23',
    endDate: '08-22'
  },
  {
    id: "6",
    name: 'Panna',
    symbol: '♍',
    element: 'Ziemia',
    startDate: '08-23',
    endDate: '09-22'
  },
  {
    id: "7",
    name: 'Waga',
    symbol: '♎',
    element: 'Powietrze',
    startDate: '09-23',
    endDate: '10-22'
  },
  {
    id: "8",
    name: 'Skorpion',
    symbol: '♏',
    element: 'Woda',
    startDate: '10-23',
    endDate: '11-21'
  },
  {
    id: "9",
    name: 'Strzelec',
    symbol: '♐',
    element: 'Ogień',
    startDate: '11-22',
    endDate: '12-21'
  },
  {
    id: "10",
    name: 'Koziorożec',
    symbol: '♑',
    element: 'Ziemia',
    startDate: '12-22',
    endDate: '01-19'
  },
  {
    id: "11",
    name: 'Wodnik',
    symbol: '♒',
    element: 'Powietrze',
    startDate: '01-20',
    endDate: '02-18'
  },
  {
    id: "12",
    name: 'Ryby',
    symbol: '♓',
    element: 'Woda',
    startDate: '02-19',
    endDate: '03-20'
  }
];

/**
 * Zwraca znak zodiaku na podstawie ID
 */
export function getZodiacSignById(id: string | null): ZodiacInfo | null {
  if (!id) return null;
  return ZODIAC_SIGNS.find(sign => sign.id === id) || null;
}

/**
 * Sprawdza czy data (MM-DD) mieści się w zakresie (uwzględniając przejście przez koniec roku)
 */
function isDateInRange(date: string, start: string, end: string): boolean {
  if (start <= end) {
    // Normalny zakres w obrębie jednego roku
    return date >= start && date <= end;
  } else {
    // Zakres przecina koniec roku (np. dla Koziorożca)
    return date >= start || date <= end;
  }
}

/**
 * Określa znak zodiaku na podstawie daty urodzenia
 * @param birthDate Data urodzenia w formacie YYYY-MM-DD lub MM-DD
 * @returns Informacja o znaku zodiaku lub null jeśli data jest niepoprawna
 */
export function getZodiacSignFromDate(birthDate: string): ZodiacInfo | null {
  // Sprawdź czy data jest poprawna
  if (!birthDate || birthDate.length < 5) return null;

  // Wyekstrahuj miesiąc i dzień
  let monthDay: string;
  if (birthDate.length > 5) {
    // Format YYYY-MM-DD
    monthDay = birthDate.substring(5); // Pobierz MM-DD
  } else {
    // Format MM-DD
    monthDay = birthDate;
  }

  // Sprawdź, czy format jest poprawny
  if (!/^\d{2}-\d{2}$/.test(monthDay)) return null;

  // Znajdź znak zodiaku dla danej daty
  for (const sign of ZODIAC_SIGNS) {
    if (isDateInRange(monthDay, sign.startDate, sign.endDate)) {
      return sign;
    }
  }

  return null;
}

/**
 * Sprawdza, czy data urodzenia jest wystarczająco kompletna do określenia znaku zodiaku
 * @param birthDate Data urodzenia 
 * @returns true jeśli data jest wystarczająca do określenia znaku zodiaku
 */
export function isDateCompleteForZodiac(birthDate: string): boolean {
  if (!birthDate) return false;
  
  // Data musi zawierać miesiąc i dzień
  if (birthDate.length < 5) return false;
  
  const monthDay = birthDate.length > 5 ? birthDate.substring(5) : birthDate;
  return /^\d{2}-\d{2}$/.test(monthDay);
}