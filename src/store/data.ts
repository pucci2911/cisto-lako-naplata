import { supabase } from '@/integrations/supabase/client';
import type { Customer, Order, OrderItem, PriceListItem, AppUser, ShopSettings } from '@/types';

const KEYS = {
  priceList: 'cisto_priceList',
  users: 'cisto_users',
  settings: 'cisto_settings',
  seeded: 'cisto_priceListSeeded',
};

function lsGet<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
function lsSet<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
function uid(): string {
  return crypto.randomUUID();
}

// ============== Mappers ==============
type CustomerRow = {
  id: string; full_name: string; phone: string; email: string | null;
  notes: string | null; preferred_notification_channel: string; created_at: string;
};
function rowToCustomer(r: CustomerRow): Customer {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email ?? undefined,
    notes: r.notes ?? undefined,
    preferredNotificationChannel: (r.preferred_notification_channel as Customer['preferredNotificationChannel']) || 'none',
    createdAt: r.created_at,
  };
}
function customerToRow(c: Partial<Customer>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (c.fullName !== undefined) r.full_name = c.fullName;
  if (c.phone !== undefined) r.phone = c.phone;
  if (c.email !== undefined) r.email = c.email ?? null;
  if (c.notes !== undefined) r.notes = c.notes ?? null;
  if (c.preferredNotificationChannel !== undefined) r.preferred_notification_channel = c.preferredNotificationChannel;
  return r;
}

type OrderRow = {
  id: string; order_number: string; customer_id: string; received_at: string;
  due_date: string; status: string; payment_status: string; payment_method: string;
  total_price: number; amount_paid: number;
  rack_location: string | null; internal_notes: string | null; customer_note: string | null;
  ready_notification_sent_at: string | null; picked_up_at: string | null;
};
function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    customerId: r.customer_id,
    receivedAt: r.received_at,
    dueDate: r.due_date,
    status: r.status as Order['status'],
    paymentStatus: r.payment_status as Order['paymentStatus'],
    paymentMethod: r.payment_method as Order['paymentMethod'],
    totalPrice: r.total_price,
    amountPaid: r.amount_paid,
    rackLocation: r.rack_location ?? undefined,
    internalNotes: r.internal_notes ?? undefined,
    customerNote: r.customer_note ?? undefined,
    readyNotificationSentAt: r.ready_notification_sent_at ?? undefined,
    pickedUpAt: r.picked_up_at ?? undefined,
  };
}
function orderToRow(o: Partial<Order>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (o.orderNumber !== undefined) r.order_number = o.orderNumber;
  if (o.customerId !== undefined) r.customer_id = o.customerId;
  if (o.receivedAt !== undefined) r.received_at = o.receivedAt;
  if (o.dueDate !== undefined) r.due_date = o.dueDate;
  if (o.status !== undefined) r.status = o.status;
  if (o.paymentStatus !== undefined) r.payment_status = o.paymentStatus;
  if (o.paymentMethod !== undefined) r.payment_method = o.paymentMethod;
  if (o.totalPrice !== undefined) r.total_price = o.totalPrice;
  if (o.amountPaid !== undefined) r.amount_paid = o.amountPaid;
  if (o.rackLocation !== undefined) r.rack_location = o.rackLocation ?? null;
  if (o.internalNotes !== undefined) r.internal_notes = o.internalNotes ?? null;
  if (o.customerNote !== undefined) r.customer_note = o.customerNote ?? null;
  if (o.readyNotificationSentAt !== undefined) r.ready_notification_sent_at = o.readyNotificationSentAt ?? null;
  if (o.pickedUpAt !== undefined) r.picked_up_at = o.pickedUpAt ?? null;
  return r;
}

type OrderItemRow = {
  id: string; order_id: string; item_name: string; category: string;
  quantity: number; unit_price: number; upcharge_amount: number | null;
  note: string | null; stain_notes: string | null; damage_notes: string | null;
  special_instructions: string | null; item_status: string;
};
function rowToOrderItem(r: OrderItemRow): OrderItem {
  return {
    id: r.id,
    orderId: r.order_id,
    itemName: r.item_name,
    category: r.category,
    quantity: r.quantity,
    unitPrice: r.unit_price,
    upchargeAmount: r.upcharge_amount ?? undefined,
    note: r.note ?? undefined,
    stainNotes: r.stain_notes ?? undefined,
    damageNotes: r.damage_notes ?? undefined,
    specialInstructions: r.special_instructions ?? undefined,
    itemStatus: r.item_status as OrderItem['itemStatus'],
  };
}
function orderItemToRow(i: Partial<OrderItem> & { orderId?: string }): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (i.orderId !== undefined) r.order_id = i.orderId;
  if (i.itemName !== undefined) r.item_name = i.itemName;
  if (i.category !== undefined) r.category = i.category;
  if (i.quantity !== undefined) r.quantity = i.quantity;
  if (i.unitPrice !== undefined) r.unit_price = i.unitPrice;
  if (i.upchargeAmount !== undefined) r.upcharge_amount = i.upchargeAmount ?? null;
  if (i.note !== undefined) r.note = i.note ?? null;
  if (i.stainNotes !== undefined) r.stain_notes = i.stainNotes ?? null;
  if (i.damageNotes !== undefined) r.damage_notes = i.damageNotes ?? null;
  if (i.specialInstructions !== undefined) r.special_instructions = i.specialInstructions ?? null;
  if (i.itemStatus !== undefined) r.item_status = i.itemStatus;
  return r;
}

// ============== Customers ==============
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('full_name');
  if (error) throw error;
  return (data ?? []).map(r => rowToCustomer(r as CustomerRow));
}
export async function getCustomer(id: string): Promise<Customer | undefined> {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data as CustomerRow) : undefined;
}
export async function saveCustomer(c: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert(customerToRow(c) as never).select('*').single();
  if (error) throw error;
  return rowToCustomer(data as CustomerRow);
}
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  const { error } = await supabase.from('customers').update(customerToRow(updates) as never).eq('id', id);
  if (error) throw error;
}

// ============== Orders ==============
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('received_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => rowToOrder(r as OrderRow));
}
export async function getOrder(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : undefined;
}

export async function getNextOrderNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('orders').select('order_number').order('order_number', { ascending: false }).limit(1);
  if (error) throw error;
  let next = 1;
  if (data && data.length > 0) {
    const m = /HC-(\d+)/.exec(data[0].order_number as string);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  return `HC-${next.toString().padStart(6, '0')}`;
}

export async function saveOrder(o: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>): Promise<Order> {
  const orderNumber = await getNextOrderNumber();
  const row = {
    ...orderToRow(o),
    order_number: orderNumber,
    received_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('orders').insert(row as never).select('*').single();
  if (error) throw error;
  return rowToOrder(data as OrderRow);
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  const { error } = await supabase.from('orders').update(orderToRow(updates) as never).eq('id', id);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

// ============== Order Items ==============
export async function getOrderItems(orderId?: string): Promise<OrderItem[]> {
  let q = supabase.from('order_items').select('*');
  if (orderId) q = q.eq('order_id', orderId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(r => rowToOrderItem(r as OrderItemRow));
}

export async function saveOrderItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('order_items').insert(orderItemToRow(item) as never).select('*').single();
  if (error) throw error;
  return rowToOrderItem(data as OrderItemRow);
}

export async function updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<void> {
  const { error } = await supabase.from('order_items').update(orderItemToRow(updates) as never).eq('id', id);
  if (error) throw error;
}

export async function deleteOrderItem(id: string): Promise<void> {
  const { error } = await supabase.from('order_items').delete().eq('id', id);
  if (error) throw error;
}

// ============== Price list (Supabase) ==============
export async function getPriceList(): Promise<PriceListItem[]> {
  const { data, error } = await supabase
    .from('price_list')
    .select('*')
    .order('category', { ascending: true })
    .order('item_name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id,
    itemName: r.item_name,
    category: r.category,
    basePrice: r.base_price,
    active: r.active,
  }));
}

export async function savePriceListItem(item: Omit<PriceListItem, 'id'>): Promise<PriceListItem> {
  const { data, error } = await supabase
    .from('price_list')
    .insert({
      item_name: item.itemName,
      category: item.category,
      base_price: item.basePrice,
      active: item.active,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    itemName: data.item_name,
    category: data.category,
    basePrice: data.base_price,
    active: data.active,
  };
}

export async function updatePriceListItem(id: string, updates: Partial<PriceListItem>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.itemName !== undefined) payload.item_name = updates.itemName;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.basePrice !== undefined) payload.base_price = updates.basePrice;
  if (updates.active !== undefined) payload.active = updates.active;
  const { error } = await supabase.from('price_list').update(payload).eq('id', id);
  if (error) throw error;
}

// ============== Users (legacy stubs) ==============
export function getUsers(): AppUser[] { return lsGet<AppUser>(KEYS.users); }
export function getUserByEmail(email: string): AppUser | undefined {
  return getUsers().find(u => u.email === email);
}

// ============== Settings (localStorage) ==============
const defaultSettings: ShopSettings = {
  shopName: 'Čisto',
  address: 'Knez Mihailova 10, Beograd',
  phone: '011 123 4567',
  email: 'info@cisto.rs',
  defaultTurnaroundDays: 3,
  receiptFooterText: 'Molimo donesite ovaj listić pri preuzimanju.',
  dashboardDisplay: 'kartice',
};
export function getSettings(): ShopSettings {
  const raw = localStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : defaultSettings;
}
export function saveSettings(s: ShopSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

// ============== Seed (only price list now) ==============
export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;
  if (!localStorage.getItem(KEYS.settings)) saveSettings(defaultSettings);
  const plData: Array<[string, string, number]> = [
    ['Košulja', 'Gornji deo', 350], ['Pantalone', 'Donji deo', 400], ['Sako', 'Gornji deo', 600],
    ['Odelo (2-delno)', 'Odela', 900], ['Haljina', 'Haljine', 700], ['Jakna', 'Jakne', 800],
    ['Kaput', 'Kaputi', 1200], ['Suknja', 'Donji deo', 350], ['Džemper', 'Džemperi', 400],
    ['Kravata', 'Dodaci', 200], ['Zavesa (par)', 'Zavese', 1500], ['Jorgan navlaka', 'Posteljina', 800],
    ['Ćebe', 'Posteljina', 1000], ['Jastuk', 'Posteljina', 500], ['Tepih mali', 'Tepisi', 1200],
  ];
  const priceList: PriceListItem[] = plData.map(([itemName, category, basePrice]) => ({
    id: uid(), itemName, category, basePrice, active: true,
  }));
  lsSet(KEYS.priceList, priceList);
  localStorage.setItem(KEYS.seeded, 'true');
}
