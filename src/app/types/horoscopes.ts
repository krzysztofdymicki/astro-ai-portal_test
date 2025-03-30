export interface Horoscope {
  id: string;
  order_id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: HoroscopeType;
  title: string;
  content: string;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  astrologer?: {
    display_name: string;
    profile_image_url: string | null;
  };
}

export interface HoroscopeOrder {
  id: string;
  user_id: string;
  astrologer_id: string;
  horoscope_type: HoroscopeType;
  status: OrderStatus;
  credits_amount: number;
  user_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  astrologer?: {
    display_name: string;
    profile_image_url: string | null;
  };
}

export type HoroscopeType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

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

export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case 'pending': return 'Oczekujące';
    case 'processing': return 'W trakcie przygotowania';
    case 'completed': return 'Zakończone';
    case 'cancelled': return 'Anulowane';
    default: return status;
  }
}
