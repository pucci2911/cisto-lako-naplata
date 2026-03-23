export type OrderStatus = 'Primljeno' | 'U obradi' | 'Spremno' | 'Preuzeto' | 'Otkazano';
export type PaymentStatus = 'Nije placeno' | 'Delimicno placeno' | 'Placeno';
export type PaymentMethod = 'Kes' | 'Kartica' | 'Kombinovano';
export type NotificationChannel = 'email' | 'none';
export type ItemStatus = 'Na cekanju' | 'U obradi' | 'Gotovo';
export type UserRole = 'owner' | 'employee';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  preferredNotificationChannel: NotificationChannel;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  receivedAt: string;
  dueDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  amountPaid: number;
  rackLocation?: string;
  internalNotes?: string;
  customerNote?: string;
  readyNotificationSentAt?: string;
  pickedUpAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  upchargeAmount?: number;
  note?: string;
  stainNotes?: string;
  damageNotes?: string;
  specialInstructions?: string;
  itemStatus: ItemStatus;
}

export interface PriceListItem {
  id: string;
  category: string;
  itemName: string;
  basePrice: number;
  active: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type DashboardDisplayMode = 'kartice' | 'pie' | 'bar' | 'line';

export interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  defaultTurnaroundDays: number;
  receiptFooterText: string;
  dashboardDisplay: DashboardDisplayMode;
}
