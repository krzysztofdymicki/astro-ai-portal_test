// src/__tests__/utils/utils.test.ts
import {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    truncateText,
    getInitials,
    isValidEmail
  } from '@/lib/utils';
  
  describe('Utils functions', () => {
    // Stały czas dla testów
    const mockDate = new Date('2023-05-15T10:30:00');
    
    describe('formatDate', () => {
      it('should format date correctly', () => {
        expect(formatDate(mockDate)).toBe('15 maja 2023');
      });
    });
  
    describe('formatTime', () => {
      it('should format time correctly', () => {
        expect(formatTime(mockDate)).toBe('10:30');
      });
    });
  
    describe('formatDateTime', () => {
      it('should format date and time correctly', () => {
        expect(formatDateTime(mockDate)).toBe('15 maja 2023, 10:30');
      });
    });
  
    describe('formatRelativeTime', () => {
      beforeAll(() => {
        // Mockujemy globalną datę dla testów
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-05-15T12:30:00'));
      });
  
      afterAll(() => {
        jest.useRealTimers();
      });
  
      it('should return "przed chwilą" for time less than 1 minute ago', () => {
        const date = new Date('2023-05-15T12:29:30');
        expect(formatRelativeTime(date)).toBe('przed chwilą');
      });
  
      it('should format minutes correctly', () => {
        const date = new Date('2023-05-15T12:00:00');
        expect(formatRelativeTime(date)).toBe('30 minut temu');
      });
  
      it('should format hours correctly', () => {
        const date = new Date('2023-05-15T10:30:00');
        expect(formatRelativeTime(date)).toBe('2 godziny temu');
      });
  
      it('should format days correctly', () => {
        const date = new Date('2023-05-13T12:30:00');
        expect(formatRelativeTime(date)).toBe('2 dni temu');
      });
  
      it('should return formatted date for time more than 7 days ago', () => {
        const date = new Date('2023-05-01T12:30:00');
        expect(formatRelativeTime(date)).toBe('1 maja 2023');
      });
    });
  
    describe('truncateText', () => {
      it('should truncate text if longer than maxLength', () => {
        const text = 'Lorem ipsum dolor sit amet';
        expect(truncateText(text, 10)).toBe('Lorem ipsu...');
      });
  
      it('should not truncate text if shorter than maxLength', () => {
        const text = 'Lorem ipsum';
        expect(truncateText(text, 20)).toBe('Lorem ipsum');
      });
    });
  
    describe('getInitials', () => {
      it('should return initials from first and last name', () => {
        expect(getInitials('Jan', 'Kowalski')).toBe('JK');
      });
  
      it('should handle missing last name', () => {
        expect(getInitials('Jan', null)).toBe('J');
      });
  
      it('should handle missing first name', () => {
        expect(getInitials(null, 'Kowalski')).toBe('K');
      });
  
      it('should return "U" if both names are missing', () => {
        expect(getInitials(null, null)).toBe('U');
      });
    });
  
    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      });
  
      it('should reject invalid email addresses', () => {
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('test@example')).toBe(false);
        expect(isValidEmail('testexample.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });
  });