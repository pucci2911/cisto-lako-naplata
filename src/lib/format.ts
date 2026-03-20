import { format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@/types';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy HH:mm');
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('sr-RS')} RSD`;
}

export function isToday(date: string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case 'Primljeno': return 'bg-blue-100 text-blue-800';
    case 'U obradi': return 'bg-amber-100 text-amber-800';
    case 'Spremno': return 'bg-green-100 text-green-800';
    case 'Preuzeto': return 'bg-gray-100 text-gray-600';
    case 'Otkazano': return 'bg-red-100 text-red-700';
  }
}

export function paymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'Placeno': return 'bg-green-100 text-green-800';
    case 'Delimicno placeno': return 'bg-amber-100 text-amber-800';
    case 'Nije placeno': return 'bg-red-100 text-red-700';
  }
}
