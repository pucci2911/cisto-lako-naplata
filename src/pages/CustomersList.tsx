import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/lib/queries';
import { Input } from '@/components/ui/input';

export default function CustomersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading } = useQuery(queries.customers());
  const { data: orders = [] } = useQuery(queries.orders());

  const orderCountById = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach(o => m.set(o.customerId, (m.get(o.customerId) ?? 0) + 1));
    return m;
  }, [orders]);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <h1 className="text-title mb-6">Kupci</h1>
      <Input placeholder="Pretražite po imenu ili telefonu..." value={search} onChange={e => setSearch(e.target.value)}
        className="mb-4 h-12 text-base max-w-md" />

      <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Ime</th>
                <th className="text-left px-4 py-3 font-medium">Telefon</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="text-right px-4 py-3 font-medium">Porudžbine</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => navigate(`/kupci/${c.id}`)}
                  className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium">{c.fullName}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{orderCountById.get(c.id) ?? 0}</td>
                </tr>
              ))}
              {isLoading && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Učitavanje...</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nema kupaca.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
