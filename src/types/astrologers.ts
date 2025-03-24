// src/types/astrologer.ts

// Typy horoskopów
export type HoroscopeType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

// Status zamówienia horoskopu
export type HoroscopeOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// Główne informacje o astrologu
export interface Astrologer {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
  short_bio: string | null;
  full_bio: string | null;
  years_of_experience: number | null;
  rating_average: number;
  ratings_count: number;
  languages: string[] | null;
  is_featured: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Dostępność astrologa
export interface AstrologerAvailability {
  id: string;
  astrologer_id: string;
  day_of_week: number; // 0-6, 0 = Niedziela
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

// Recenzja astrologa
export interface AstrologerReview {
  id: string;
  astrologer_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
  }; // Dla wyświetlania danych recenzenta
}

// Ceny horoskopów dla astrologa (w kredytach)
export interface AstrologerHoroscopePrice {
  id: string;
  astrologer_id: string;
  horoscope_type: HoroscopeType;
  credits_price: number; // Cena w kredytach
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Zamówienie horoskopu
export interface HoroscopeOrder {
  id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: HoroscopeType;
  status: HoroscopeOrderStatus;
  credits_amount: number; // Ilość kredytów
  user_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Gotowy horoskop
export interface Horoscope {
  id: string;
  order_id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: HoroscopeType;
  title: string;
  content: string;
  valid_from: string | null; // format daty: YYYY-MM-DD
  valid_to: string | null; // format daty: YYYY-MM-DD
  created_at: string;
}

// Rozszerzony astrolog ze wszystkimi powiązanymi danymi
export interface AstrologerWithDetails extends Astrologer {
  availability?: AstrologerAvailability[];
  reviews?: AstrologerReview[];
  horoscope_prices?: AstrologerHoroscopePrice[];
}