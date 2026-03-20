export interface AuditEntry {
  id: string;
  orderId: string;
  timestamp: string;
  description: string;
}

const KEY = 'cisto_audit';

function getAll(): AuditEntry[] {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

function save(entries: AuditEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addAuditEntry(orderId: string, description: string) {
  const all = getAll();
  all.push({ id: crypto.randomUUID(), orderId, timestamp: new Date().toISOString(), description });
  save(all);
}

export function getAuditEntries(orderId: string): AuditEntry[] {
  return getAll().filter(e => e.orderId === orderId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
