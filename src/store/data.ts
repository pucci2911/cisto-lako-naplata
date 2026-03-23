import type { Customer, Order, OrderItem, PriceListItem, AppUser, ShopSettings } from '@/types';

const KEYS = {
  customers: 'cisto_customers',
  orders: 'cisto_orders',
  orderItems: 'cisto_orderItems',
  priceList: 'cisto_priceList',
  users: 'cisto_users',
  settings: 'cisto_settings',
  orderSeq: 'cisto_orderSeq',
  seeded: 'cisto_seeded',
};

function get<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return crypto.randomUUID();
}

// Customers
export function getCustomers(): Customer[] { return get<Customer>(KEYS.customers); }
export function getCustomer(id: string): Customer | undefined { return getCustomers().find(c => c.id === id); }
export function saveCustomer(c: Omit<Customer, 'id' | 'createdAt'>): Customer {
  const all = getCustomers();
  const customer: Customer = { ...c, id: uid(), createdAt: new Date().toISOString() };
  all.push(customer);
  set(KEYS.customers, all);
  return customer;
}
export function updateCustomer(id: string, updates: Partial<Customer>) {
  const all = getCustomers().map(c => c.id === id ? { ...c, ...updates } : c);
  set(KEYS.customers, all);
}

// Orders
export function getOrders(): Order[] { return get<Order>(KEYS.orders); }
export function getOrder(id: string): Order | undefined { return getOrders().find(o => o.id === id); }

export function getNextOrderNumber(): string {
  const seq = parseInt(localStorage.getItem(KEYS.orderSeq) || '0') + 1;
  localStorage.setItem(KEYS.orderSeq, seq.toString());
  return `HC-${seq.toString().padStart(6, '0')}`;
}

export function saveOrder(o: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>): Order {
  const all = getOrders();
  const order: Order = { ...o, id: uid(), orderNumber: getNextOrderNumber(), receivedAt: new Date().toISOString() };
  all.push(order);
  set(KEYS.orders, all);
  return order;
}

export function updateOrder(id: string, updates: Partial<Order>) {
  const all = getOrders().map(o => o.id === id ? { ...o, ...updates } : o);
  set(KEYS.orders, all);
}

// Order Items
export function getOrderItems(orderId?: string): OrderItem[] {
  const all = get<OrderItem>(KEYS.orderItems);
  return orderId ? all.filter(i => i.orderId === orderId) : all;
}

export function saveOrderItem(item: Omit<OrderItem, 'id'>): OrderItem {
  const all = get<OrderItem>(KEYS.orderItems);
  const oi: OrderItem = { ...item, id: uid() };
  all.push(oi);
  set(KEYS.orderItems, all);
  return oi;
}

export function updateOrderItem(id: string, updates: Partial<OrderItem>) {
  const all = get<OrderItem>(KEYS.orderItems).map(i => i.id === id ? { ...i, ...updates } : i);
  set(KEYS.orderItems, all);
}

export function deleteOrderItem(id: string) {
  set(KEYS.orderItems, get<OrderItem>(KEYS.orderItems).filter(i => i.id !== id));
}

// Price list
export function getPriceList(): PriceListItem[] { return get<PriceListItem>(KEYS.priceList); }
export function savePriceListItem(item: Omit<PriceListItem, 'id'>): PriceListItem {
  const all = getPriceList();
  const p: PriceListItem = { ...item, id: uid() };
  all.push(p);
  set(KEYS.priceList, all);
  return p;
}
export function updatePriceListItem(id: string, updates: Partial<PriceListItem>) {
  set(KEYS.priceList, getPriceList().map(p => p.id === id ? { ...p, ...updates } : p));
}

// Users
export function getUsers(): AppUser[] { return get<AppUser>(KEYS.users); }
export function getUserByEmail(email: string): AppUser | undefined {
  return getUsers().find(u => u.email === email);
}
export function saveUser(u: Omit<AppUser, 'id'> & { password: string }): AppUser {
  const all = getUsers();
  const user: AppUser = { id: uid(), name: u.name, email: u.email, role: u.role, active: u.active };
  all.push(user);
  set(KEYS.users, all);
  // Store password
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem('cisto_passwords') || '{}');
  passwords[u.email] = u.password;
  localStorage.setItem('cisto_passwords', JSON.stringify(passwords));
  return user;
}
export function updateUser(id: string, updates: Partial<AppUser>) {
  set(KEYS.users, getUsers().map(u => u.id === id ? { ...u, ...updates } : u));
}

// Settings
export function getSettings(): ShopSettings {
  const raw = localStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : defaultSettings;
}
export function saveSettings(s: ShopSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

const defaultSettings: ShopSettings = {
  shopName: 'Čisto',
  address: 'Knez Mihailova 10, Beograd',
  phone: '011 123 4567',
  email: 'info@cisto.rs',
  defaultTurnaroundDays: 3,
  receiptFooterText: 'Molimo donesite ovaj listić pri preuzimanju.',
  dashboardDisplay: 'kartice',
};

// Seed
export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.seeded)) return;

  // Users
  const users: AppUser[] = [
    { id: uid(), name: 'Vlasnik', email: 'demo@cisto.rs', role: 'owner', active: true },
  ];
  set(KEYS.users, users);

  // Settings
  saveSettings(defaultSettings);

  // Customers
  const custData: Array<[string, string, string?]> = [
    ['Marko Jovanović', '0641234567', 'marko@email.com'],
    ['Ana Petrović', '0652345678', 'ana@email.com'],
    ['Nikola Stojanović', '0633456789'],
    ['Jelena Đorđević', '0614567890', 'jelena@email.com'],
    ['Stefan Ilić', '0625678901'],
    ['Milica Pavlović', '0646789012', 'milica@email.com'],
    ['Dragana Nikolić', '0657890123'],
    ['Aleksandar Tomić', '0638901234', 'aleksandar@email.com'],
    ['Ivana Marković', '0619012345', 'ivana@email.com'],
    ['Miloš Stanković', '0640123456'],
  ];
  const customers: Customer[] = custData.map(([fullName, phone, email]) => ({
    id: uid(), fullName, phone, email, preferredNotificationChannel: email ? 'email' as const : 'none' as const, createdAt: new Date().toISOString(),
  }));
  set(KEYS.customers, customers);

  // Price list
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
  set(KEYS.priceList, priceList);

  // Orders
  const statuses: Array<{ status: import('@/types').OrderStatus; count: number }> = [
    { status: 'Primljeno', count: 5 }, { status: 'U obradi', count: 4 },
    { status: 'Spremno', count: 4 }, { status: 'Preuzeto', count: 5 }, { status: 'Otkazano', count: 2 },
  ];
  const payStatuses: import('@/types').PaymentStatus[] = ['Nije placeno', 'Delimicno placeno', 'Placeno'];
  const payMethods: import('@/types').PaymentMethod[] = ['Kes', 'Kartica', 'Kombinovano'];

  let orderSeq = 0;
  const allOrders: Order[] = [];
  const allItems: OrderItem[] = [];

  statuses.forEach(({ status, count }) => {
    for (let i = 0; i < count; i++) {
      orderSeq++;
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const dayOffset = status === 'Preuzeto' ? -(Math.floor(Math.random() * 10) + 1) :
                        status === 'Spremno' ? -(Math.floor(Math.random() * 3)) :
                        status === 'Primljeno' ? Math.floor(Math.random() * 5) :
                        status === 'Otkazano' ? -(Math.floor(Math.random() * 5)) :
                        Math.floor(Math.random() * 3);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dayOffset);
      const receivedDate = new Date(dueDate);
      receivedDate.setDate(receivedDate.getDate() - 3);

      const numItems = Math.floor(Math.random() * 3) + 1;
      let totalPrice = 0;
      const orderId = uid();

      for (let j = 0; j < numItems; j++) {
        const pl = priceList[Math.floor(Math.random() * priceList.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const upcharge = Math.random() > 0.7 ? Math.floor(Math.random() * 3) * 100 : 0;
        totalPrice += (pl.basePrice + upcharge) * qty;
        allItems.push({
          id: uid(), orderId, itemName: pl.itemName, category: pl.category,
          quantity: qty, unitPrice: pl.basePrice, upchargeAmount: upcharge || undefined,
          itemStatus: status === 'Preuzeto' || status === 'Spremno' ? 'Gotovo' : status === 'U obradi' ? 'U obradi' : 'Na cekanju',
        });
      }

      const ps = payStatuses[Math.floor(Math.random() * payStatuses.length)];
      const paid = ps === 'Placeno' ? totalPrice : ps === 'Delimicno placeno' ? Math.round(totalPrice * 0.5) : 0;

      allOrders.push({
        id: orderId,
        orderNumber: `HC-${orderSeq.toString().padStart(6, '0')}`,
        customerId: cust.id,
        receivedAt: receivedDate.toISOString(),
        dueDate: dueDate.toISOString().split('T')[0],
        status,
        paymentStatus: ps,
        paymentMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
        totalPrice, amountPaid: paid,
        rackLocation: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10) + 1}`,
        readyNotificationSentAt: status === 'Spremno' && cust.email ? new Date().toISOString() : undefined,
        pickedUpAt: status === 'Preuzeto' ? new Date().toISOString() : undefined,
      });
    }
  });

  localStorage.setItem(KEYS.orderSeq, orderSeq.toString());
  set(KEYS.orders, allOrders);
  set(KEYS.orderItems, allItems);
  localStorage.setItem(KEYS.seeded, 'true');
}
