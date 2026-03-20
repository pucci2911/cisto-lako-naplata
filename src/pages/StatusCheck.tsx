import React, { useState } from 'react';
import { getOrders, getCustomer, getSettings } from '@/store/data';
import { formatDate, statusColor } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle2, Clock, Loader2, PackageCheck, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types';

const statusMessages: Record<OrderStatus, { message: string; icon: React.ReactNode; bgClass: string }> = {
  'Primljeno': {
    message: 'Vaša porudžbina je primljena i čeka obradu.',
    icon: <Clock size={24} className="text-blue-600" />,
    bgClass: 'bg-blue-50 border-blue-200',
  },
  'U obradi': {
    message: 'Vaša porudžbina je trenutno u obradi.',
    icon: <Loader2 size={24} className="text-amber-600" />,
    bgClass: 'bg-amber-50 border-amber-200',
  },
  'Spremno': {
    message: 'Vaša porudžbina je spremna. Molimo dođite po nju u radno vreme.',
    icon: <CheckCircle2 size={24} className="text-green-700" />,
    bgClass: 'bg-green-50 border-green-300',
  },
  'Preuzeto': {
    message: 'Ova porudžbina je već preuzeta.',
    icon: <PackageCheck size={24} className="text-gray-600" />,
    bgClass: 'bg-gray-50 border-gray-200',
  },
  'Otkazano': {
    message: 'Ova porudžbina je otkazana. Kontaktirajte nas za više informacija.',
    icon: <XCircle size={24} className="text-red-600" />,
    bgClass: 'bg-red-50 border-red-200',
  },
};

export default function StatusCheck() {
  const settings = getSettings();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<null | { found: false } | { found: true; orderNumber: string; status: OrderStatus; dueDate: string }>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = getOrders().find(o => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());
    if (!order) { setResult({ found: false }); return; }
    const customer = getCustomer(order.customerId);
    if (!customer || customer.phone !== phone.trim()) { setResult({ found: false }); return; }
    setResult({ found: true, orderNumber: order.orderNumber, status: order.status, dueDate: order.dueDate });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Shop branding */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-1">{settings.shopName}</h1>
          <p className="text-muted-foreground">{settings.phone}</p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-lg shadow-black/5 border border-border/50">
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">Proverite status porudžbine</h2>

          <form onSubmit={handleSearch} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Broj porudžbine</Label>
              <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="HC-000001" className="h-12 text-base font-mono" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Broj telefona</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="06XXXXXXXX" className="h-12 text-base" required />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold gap-2">
              <Search size={18} /> Proveri status
            </Button>
          </form>
        </div>

        {result && (
          <div className="mt-6 bg-card rounded-xl p-6 shadow-sm shadow-black/5 border border-border/50">
            {!result.found ? (
              <p className="text-center text-muted-foreground">
                Porudžbina nije pronađena. Proverite broj i pokušajte ponovo.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Porudžbina</p>
                  <p className="text-2xl font-bold font-mono">{result.orderNumber}</p>
                </div>

                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>

                {/* Status-specific message */}
                <div className={`flex items-start gap-3 rounded-lg border p-4 ${statusMessages[result.status].bgClass}`}>
                  <div className="shrink-0 mt-0.5">{statusMessages[result.status].icon}</div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {statusMessages[result.status].message}
                  </p>
                </div>

                <div className="text-center pt-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Datum preuzimanja</p>
                  <p className="font-medium">{formatDate(result.dueDate)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
