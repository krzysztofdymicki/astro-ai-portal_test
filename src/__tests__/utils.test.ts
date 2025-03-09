// src/__tests__/utils.test.ts
import {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    truncateText,
    getInitials,
    isValidEmail
  } from '../lib/utils';
  
  describe('Utility functions', () => {
    describe('formatDate', () => {
      test('formatuje datę w formacie polskim', () => {
        const date = new Date('2023-05-15T12:00:00');
        expect(formatDate(date)).toBe('15 maja 2023');
      });
    });
  
    describe('formatTime', () => {
      test('formatuje czas w formacie polskim', () => {
        const date = new Date('2023-05-15T14:30:00');
        expect(formatTime(date)).toBe('14:30');
      });
    });
  
    describe('formatDateTime', () => {
      test('formatuje datę i czas w formacie polskim', () => {
        const date = new Date('2023-05-15T14:30:00');
        expect(formatDateTime(date)).toBe('15 maja 2023, 14:30');
      });
    });
  
    describe('formatRelativeTime', () => {
      beforeEach(() => {
        // Mock dla Date.now()
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-05-15T12:00:00'));
      });
  
      afterEach(() => {
        jest.useRealTimers();
      });
  
      test('zwraca "przed chwilą" dla czasu poniżej minuty', () => {
        const date = new Date('2023-05-15T11:59:30');
        expect(formatRelativeTime(date)).toBe('przed chwilą');
      });
  
      test('zwraca minuty dla czasu poniżej godziny', () => {
        const date = new Date('2023-05-15T11:30:00');
        expect(formatRelativeTime(date)).toBe('30 minut temu');
      });
  
      test('zwraca godziny dla czasu poniżej doby', () => {
        const date = new Date('2023-05-15T06:00:00');
        expect(formatRelativeTime(date)).toBe('6 godzin temu');
      });
  
      test('zwraca dni dla czasu poniżej tygodnia', () => {
        const date = new Date('2023-05-12T12:00:00');
        expect(formatRelativeTime(date)).toBe('3 dni temu');
      });
  
      test('zwraca pełną datę dla czasu powyżej tygodnia', () => {
        const date = new Date('2023-05-01T12:00:00');
        expect(formatRelativeTime(date)).toBe('1 maja 2023');
      });
    });
  
    describe('truncateText', () => {
      test('nie skraca tekstu krótszego niż maxLength', () => {
        expect(truncateText('Krótki tekst', 20)).toBe('Krótki tekst');
      });
  
      test('skraca tekst dłuższy niż maxLength i dodaje wielokropek', () => {
        expect(truncateText('To jest bardzo długi tekst, który powinien zostać skrócony', 20)).toBe('To jest bardzo długi...');
      });
    });
  
    describe('getInitials', () => {
      test('zwraca inicjały z imienia i nazwiska', () => {
        expect(getInitials('Jan', 'Kowalski')).toBe('JK');
      });
  
      test('zwraca inicjał tylko z imienia, gdy nazwisko nie jest podane', () => {
        expect(getInitials('Jan', null)).toBe('J');
      });
  
      test('zwraca inicjał tylko z nazwiska, gdy imię nie jest podane', () => {
        expect(getInitials(null, 'Kowalski')).toBe('K');
      });
  
      test('zwraca "U" gdy ani imię ani nazwisko nie jest podane', () => {
        expect(getInitials(null, null)).toBe('U');
      });
    });
  
    describe('isValidEmail', () => {
      test('zwraca true dla poprawnego adresu email', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
      });
  
      test('zwraca false dla niepoprawnego adresu email bez @', () => {
        expect(isValidEmail('testexample.com')).toBe(false);
      });
  
      test('zwraca false dla niepoprawnego adresu email bez domeny', () => {
        expect(isValidEmail('test@')).toBe(false);
      });
  
      test('zwraca false dla niepoprawnego adresu email bez nazwy użytkownika', () => {
        expect(isValidEmail('@example.com')).toBe(false);
      });
  
      test('zwraca false dla pustego stringa', () => {
        expect(isValidEmail('')).toBe(false);
      });
    });
  });