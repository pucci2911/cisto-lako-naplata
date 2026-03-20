import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, updateCustomer, getOrders } from '@/store/data';
import { formatDate, formatPrice, statusColor } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [, forceRender] = useState(0);

  const customer = getCustomer(id!);
  if (!customer) return <div className="py-12 text-center text-muted-foreground">Kupac nije pronađen.</div>;

  const orders = getOrders().filter(o => o.customerId === customer.id).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const [name, setName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || '');
  const [notes, setNotes] = useState(customer.notes || '');

  const handleSave = () => {
    updateCustomer(customer.id, { fullName: name, phone, email: email || undefined, notes: notes || undefined });
    setEditing(false);
    forceRender(n => n + 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
        <h1 className="text-title">{customer.fullName}</h1>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="text-sm">Ime i prezime</Label><Input value={name} onChange={e => setName(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Telefon</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Napomena</Label><Input value={notes} onChange={e => setNotes(e.target.value)} className="h-11" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Sačuvaj</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Otkaži</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="font-medium text-base">{customer.fullName}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
              {customer.notes && <p className="text-sm text-muted-foreground mt-2">{customer.notes}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1"><Pencil size={14} /> Izmeni</Button>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Porudžbine ({orders.length})</h2>
      <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Br. porudžbine</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Datum</th>
              <th className="text-right px-4 py-3 font-medium">Ukupno</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => navigate(`/porudzbine/${o.id}`)}
                  className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span></td>
                  <td className="px-4 py-3">{formatDate(o.dueDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.totalPrice)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nema porudžbina.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
