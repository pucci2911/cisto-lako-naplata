import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/lib/queries';
import { formatDate, formatPrice, statusColor, paymentStatusColor, formatPaymentStatus, isToday } from '@/lib/format';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardStats from '@/components/DashboardStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useQuery(queries.orders());
  const { data: customers = [] } = useQuery(queries.customers());
  const customerById = React.useMemo(() => {
    const m = new Map<string, string>();
    customers.forEach(c => m.set(c.id, c.fullName));
    return m;
  }, [customers]);

  const activeOrders = orders.filter(o => o.status === 'Primljeno' || o.status === 'U obradi');
  const todayDue = orders.filter(o => isToday(o.dueDate) && o.status !== 'Preuzeto' && o.status !== 'Otkazano');
  const ready = orders.filter(o => o.status === 'Spremno');
  const unpaid = orders.filter(o => o.paymentStatus === 'Nije placeno' || o.paymentStatus === 'Delimicno placeno');

  const todayOrders = orders
    .filter(o => o.status !== 'Preuzeto' && o.status !== 'Otkazano')
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 20);

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

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = orders.filter(o => o.receivedAt.startsWith(dateStr)).length;
    return { date: `${d.getDate()}.${d.getMonth() + 1}.`, count };
  });

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
            {orderList.map(order => (
              <tr key={order.id} onClick={() => navigate(`/porudzbine/${order.id}`)}
                className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${highlight ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-mono font-semibold">{order.orderNumber}</td>
                <td className="px-4 py-3">{customerById.get(order.customerId) || '—'}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>{order.status}</span></td>
                <td className="px-4 py-3">{formatDate(order.dueDate)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(order.totalPrice)}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusColor(order.paymentStatus)}`}>{formatPaymentStatus(order.paymentStatus)}</span></td>
              </tr>
            ))}
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

      <DashboardStats cards={cards} dailyData={dailyData} />

      <h2 className="text-lg font-semibold mb-3">Aktivne porudžbine</h2>
      {isLoading
        ? <div className="bg-card rounded-xl px-4 py-12 text-center text-muted-foreground">Učitavanje...</div>
        : renderOrderTable(todayOrders, 'Nema aktivnih porudžbina.')}

      {overdueOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-destructive">Zakasnele porudžbine</h2>
          {renderOrderTable(overdueOrders, '', true)}
        </div>
      )}
    </div>
  );
}
