import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatowanie daty w czytelnym formacie
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Formatowanie czasu w czytelnym formacie
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatowanie daty i czasu w czytelnym formacie
export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

// Formatowanie relatywnej daty (np. "2 dni temu")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'przed chwilą';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${pluralize(diffInMinutes, 'minutę', 'minuty', 'minut')} temu`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${pluralize(diffInHours, 'godzinę', 'godziny', 'godzin')} temu`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${pluralize(diffInDays, 'dzień', 'dni', 'dni')} temu`;
  }
  
  return formatDate(date);
}

// Funkcja pomocnicza do polskiej odmiany liczebników
function pluralize(count: number, singular: string, few: string, many: string): string {
  if (count === 1) {
    return singular;
  }
  
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    return few;
  }
  
  return many;
}

// Skracanie tekstu do określonej długości
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generowanie inicjałów z imienia i nazwiska
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  let initials = '';
  
  if (firstName) {
    initials += firstName[0].toUpperCase();
  }
  
  if (lastName) {
    initials += lastName[0].toUpperCase();
  }
  
  // Jeśli nie ma imienia ani nazwiska, użyj "U" (User)
  return initials || 'U';
}

// Walidacja adresu email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}