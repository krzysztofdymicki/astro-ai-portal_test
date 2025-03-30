import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoroscopeOrder, formatHoroscopeType, formatOrderStatus } from '@/app/types/horoscopes';
import { getHoroscopeTypeIcon, StatusIcon, formatDate } from '@/lib/horoscope-utils';

interface HoroscopeOrderCardProps {
  order: HoroscopeOrder;
}

export function HoroscopeOrderCard({ order }: HoroscopeOrderCardProps) {
  return (
    <Link href={`/dashboard/horoscopes/pending#${order.id}`}
          className="block transform transition-transform hover:scale-102">
    </Link>
  );
}
