import React, { useState } from 'react';
import { getOrders, getCustomer } from '@/store/data';
import { formatDate, statusColor } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

export default function StatusCheck() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<null | { found: false } | { found: true; orderNumber: string; status: string; dueDate: string; ready: boolean }>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = getOrders().find(o => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());
    if (!order) { setResult({ found: false }); return; }
    const customer = getCustomer(order.customerId);
    if (!customer || customer.phone !== phone.trim()) { setResult({ found: false }); return; }
    setResult({ found: true, orderNumber: order.orderNumber, status: order.status, dueDate: order.dueDate, ready: order.status === 'Spremno' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-display text-primary mb-2">Čisto</h1>
          <p className="text-muted-foreground text-body-lg">Proverite status vaše porudžbine</p>
        </div>

        <form onSubmit={handleSearch} className="bg-card rounded-xl p-8 shadow-lg shadow-black/5 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Broj porudžbine</Label>
            <Input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="HC-000001" className="h-12 text-base font-mono" required />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Broj telefona</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="06XXXXXXXX" className="h-12 text-base" required />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold gap-2"><Search size={18} /> Proveri status</Button>
        </form>

        {result && (
          <div className="mt-6 bg-card rounded-xl p-6 shadow-sm shadow-black/5">
            {!result.found ? (
              <p className="text-center text-muted-foreground">Porudžbina nije pronađena. Proverite podatke i pokušajte ponovo.</p>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Porudžbina</p>
                  <p className="text-2xl font-bold font-mono">{result.orderNumber}</p>
                </div>
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColor(result.status as any)}`}>{result.status}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Datum preuzimanja</p>
                  <p className="font-medium">{formatDate(result.dueDate)}</p>
                </div>
                {result.ready && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-semibold">Vaša porudžbina je spremna. Možete je preuzeti.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
