import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queries, queryKeys } from '@/lib/queries';
import { updateCustomer } from '@/store/data';
import { formatDate, formatPrice, statusColor } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Pencil } from 'lucide-react';
import type { Customer } from '@/types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const { data: customer, isLoading } = useQuery(queries.customer(id));
  const { data: allOrders = [] } = useQuery(queries.orders());

  useEffect(() => {
    if (customer) {
      setName(customer.fullName);
      setPhone(customer.phone);
      setEmail(customer.email || '');
      setNotes(customer.notes || '');
    }
  }, [customer]);

  const orders = useMemo(
    () => customer ? allOrders.filter(o => o.customerId === customer.id) : [],
    [allOrders, customer]
  );

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Customer>) => updateCustomer(id!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customer(id!) });
      qc.invalidateQueries({ queryKey: queryKeys.customers });
      setEditing(false);
    },
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Učitavanje...</div>;
  if (!customer) return <div className="py-12 text-center text-muted-foreground">Kupac nije pronađen.</div>;

  const handleSave = () => {
    updateMutation.mutate({
      fullName: name,
      phone,
      email: email || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
        <h1 className="text-title">{customer.fullName}</h1>
      </div>

      <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm shadow-black/5 mb-6">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="text-sm">Ime i prezime</Label><Input value={name} onChange={e => setName(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Telefon</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="h-11" /></div>
              <div><Label className="text-sm">Napomena</Label><Input value={notes} onChange={e => setNotes(e.target.value)} className="h-11" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending}>Sačuvaj</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Otkaži</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="space-y-1 min-w-0">
              <p className="font-medium text-base">{customer.fullName}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
              {customer.notes && <p className="text-sm text-muted-foreground mt-2">{customer.notes}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1 shrink-0"><Pencil size={14} /> Izmeni</Button>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Porudžbine ({orders.length})</h2>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {orders.map(o => (
          <button key={o.id} onClick={() => navigate(`/porudzbine/${o.id}`)}
            className="w-full text-left bg-card rounded-xl p-4 shadow-sm shadow-black/5 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-mono font-semibold">{o.orderNumber}</span>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-2">
              <span className="text-sm text-muted-foreground">{formatDate(o.dueDate)}</span>
              <span className="font-semibold tabular-nums">{formatPrice(o.totalPrice)}</span>
            </div>
          </button>
        ))}
        {orders.length === 0 && (
          <div className="bg-card rounded-xl p-6 text-center shadow-sm">
            <p className="text-muted-foreground">Nema porudžbina.</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
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
