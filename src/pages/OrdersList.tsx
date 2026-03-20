import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getCustomer } from '@/store/data';
import { formatDate, formatPrice, statusColor, paymentStatusColor } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OrderStatus } from '@/types';

const statuses: Array<OrderStatus | 'Sve'> = ['Sve', 'Primljeno', 'U obradi', 'Spremno', 'Preuzeto', 'Otkazano'];

export default function OrdersList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderStatus | 'Sve'>('Sve');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const orders = getOrders()
    .filter(o => filter === 'Sve' || o.status === filter)
    .filter(o => {
      if (!search) return true;
      const q = search.toLowerCase();
      const c = getCustomer(o.customerId);
      return o.orderNumber.toLowerCase().includes(q) ||
        c?.fullName.toLowerCase().includes(q) ||
        c?.phone.includes(q);
    })
    .filter(o => {
      if (!dateFrom && !dateTo) return true;
      const received = new Date(o.receivedAt);
      received.setHours(0, 0, 0, 0);
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        return received >= from && received <= to;
      }
      return true;
    })
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return (
    <div>
      <h1 className="text-title mb-6">Porudžbine</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted border'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input placeholder="Pretražite po broju, imenu ili telefonu..." value={search} onChange={e => setSearch(e.target.value)}
          className="h-12 text-base max-w-md" />
        <div className="flex gap-2 items-end">
          <div>
            <Label className="text-sm text-muted-foreground">Od datuma</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Do datuma</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-12" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-sm text-muted-foreground hover:text-foreground underline pb-3">Poništi</button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Br. porudžbine</th>
                <th className="text-left px-4 py-3 font-medium">Kupac</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Telefon</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Datum</th>
                <th className="text-right px-4 py-3 font-medium">Ukupno</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Plaćanje</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const customer = getCustomer(order.customerId);
                return (
                  <tr key={order.id} onClick={() => navigate(`/porudzbine/${order.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3">{customer?.fullName || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{customer?.phone}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>{order.status}</span></td>
                    <td className="px-4 py-3">{formatDate(order.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Nema porudžbina.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
