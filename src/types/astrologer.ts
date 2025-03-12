// src/types/astrologer.ts

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface AstrologerSpecialty {
  id: string;
  astrologer_id: string;
  specialty_id: string;
  years_experience: number | null;
  description: string | null;
  created_at: string;
  specialty: Specialty; // Relacja z tabeli specialties
}

export interface Astrologer {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string | null;
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
  consultation_price: number | null;
  created_at: string;
  updated_at: string;
  
  // Zintegrowane relacje dla list astrologów
  astrologer_specialties?: AstrologerSpecialty[];
  is_favorite?: boolean; // Flaga, czy astrolog jest ulubiony przez zalogowanego użytkownika
}

export interface AstrologerReview {
  id: string;
  astrologer_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
  }; // Dla wyświetlania danych recenzenta
}

export interface AstrologerAvailability {
  id: string;
  astrologer_id: string;
  day_of_week: number; // 0-6, 0 = Niedziela
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AstrologerCredential {
  id: string;
  astrologer_id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  description: string | null;
  credential_url: string | null;
  created_at: string;
}

// Typ dla szczegółowego widoku astrologa z wszystkimi relacjami
export interface AstrologerWithDetails extends Astrologer {
  specialties: AstrologerSpecialty[];
  reviews: AstrologerReview[];
  availability: AstrologerAvailability[];
  credentials: AstrologerCredential[];
}

// Filtry dla wyszukiwania astrologów
export interface AstrologerFilters {
  specialties?: string[];
  minRating?: number;
  minExperience?: number;
  maxPrice?: number;
  languages?: string[];
  isAvailable?: boolean;
  searchQuery?: string;
}