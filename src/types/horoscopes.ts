export type HoroscopeType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export type HoroscopeStatus = 'draft' | 'published' | 'archived';
export type HoroscopeOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Astrologer {
  id: string;
  display_name: string;
  profile_image_url?: string;
  cover_image_url?: string;
  short_bio?: string;
  full_bio?: string;
  years_of_experience?: number;
  rating_average?: number;
  ratings_count?: number;
  languages?: string[];
  is_featured?: boolean;
  is_available?: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Horoscope {
  id: string;
  user_id: string;
  astrologer_id: string;
  astrologer?: Astrologer;
  order_id: string;
  horoscope_type: HoroscopeType;
  content: string;
  title: string;
  status: HoroscopeStatus;
  created_at: string;
  valid_from: string;
  valid_to: string;
  zodiac_sign: string;
}

export interface HoroscopeOrder {
  id: string;
  user_id: string;
  astrologer_id: string;
  astrologer?: Astrologer;
  horoscope_type: HoroscopeType;
  user_notes?: string;
  status: HoroscopeOrderStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  credits_amount: number;
  horoscope_id?: string;
  zodiac_sign: string;
}

export interface HoroscopeTabsState {
  activeTab: string;
}

// Helper functions that relate to horoscope types
export function formatHoroscopeType(type: HoroscopeType): string {
  switch (type) {
    case 'daily': return 'Dzienny';
    case 'weekly': return 'Tygodniowy';
    case 'monthly': return 'Miesięczny';
    case 'yearly': return 'Roczny';
    case 'lifetime': return 'Życiowy';
    default: return type;
  }
}

export function formatOrderStatus(status: HoroscopeOrderStatus): string {
  switch (status) {
    case 'pending': return 'Oczekujące';
    case 'processing': return 'W trakcie przygotowania';
    case 'completed': return 'Zakończone';
    case 'cancelled': return 'Anulowane';
    default: return status;
  }
}
