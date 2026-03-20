import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getCustomer } from '@/store/data';
import { formatDate, formatPrice, statusColor, paymentStatusColor, isToday } from '@/lib/format';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const orders = getOrders();

  const activeOrders = orders.filter(o => o.status === 'Primljeno' || o.status === 'U obradi');
  const todayDue = orders.filter(o => isToday(o.dueDate) && o.status !== 'Preuzeto' && o.status !== 'Otkazano');
  const ready = orders.filter(o => o.status === 'Spremno');
  const unpaid = orders.filter(o => o.paymentStatus === 'Nije placeno' || o.paymentStatus === 'Delimicno placeno');

  const todayOrders = orders
    .filter(o => o.status !== 'Preuzeto' && o.status !== 'Otkazano')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 20);

  // Overdue orders: dueDate in past, not Preuzeto/Otkazano
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueOrders = orders.filter(o => {
    const due = new Date(o.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && o.status !== 'Preuzeto' && o.status !== 'Otkazano';
  });

  const cards = [
    { label: 'Aktivne porudžbine', value: activeOrders.length, color: 'border-l-primary' },
    { label: 'Danas na čekanju', value: todayDue.length, color: 'border-l-warning' },
    { label: 'Spremno za preuzimanje', value: ready.length, color: 'border-l-success' },
    { label: 'Neplaćeno ili delimično', value: unpaid.length, color: 'border-l-destructive' },
  ];

  const renderOrderTable = (orderList: typeof orders, emptyMsg: string, highlight?: boolean) => (
    <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Br. porudžbine</th>
              <th className="text-left px-4 py-3 font-medium">Kupac</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Datum preuzimanja</th>
              <th className="text-right px-4 py-3 font-medium">Ukupno</th>
              <th className="text-left px-4 py-3 font-medium">Plaćanje</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map(order => {
              const customer = getCustomer(order.customerId);
              return (
                <tr key={order.id} onClick={() => navigate(`/porudzbine/${order.id}`)}
                  className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${highlight ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3">{customer?.fullName || '—'}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-4 py-3">{formatDate(order.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(order.totalPrice)}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span></td>
                </tr>
              );
            })}
            {orderList.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{emptyMsg}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title">Kontrolna tabla</h1>
        <Button onClick={() => navigate('/nova-porudzbina')} size="lg" className="h-12 px-6 text-base font-semibold gap-2">
          <Plus size={20} /> Nova porudžbina
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`bg-card rounded-xl p-5 shadow-sm shadow-black/5 border-l-4 ${card.color}`}>
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Današnje porudžbine</h2>
      {renderOrderTable(todayOrders, 'Nema aktivnih porudžbina.')}

      {overdueOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-destructive">Zakasnele porudžbine</h2>
          {renderOrderTable(overdueOrders, '', true)}
        </div>
      )}
    </div>
  );
}
