import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getCustomer } from '@/store/data';
import { isToday, formatPrice } from '@/lib/format';

export default function ReportsPage() {
  const navigate = useNavigate();
  const orders = getOrders();

  // Prihod danas — sum of amountPaid for orders received today
  const todayReceived = orders.filter(o => isToday(o.receivedAt));
  const revenueToday = todayReceived.reduce((sum, o) => sum + o.amountPaid, 0);

  // Porudžbine primljene danas
  const ordersReceivedToday = todayReceived.length;

  // Porudžbine završene danas — Preuzeto with pickedUpAt today
  const completedToday = orders.filter(o => o.status === 'Preuzeto' && o.pickedUpAt && isToday(o.pickedUpAt)).length;

  // Neplaćene ili delimično plaćene
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'Nije placeno' || o.paymentStatus === 'Delimicno placeno');
  const unpaidCount = unpaidOrders.length;
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + (o.totalPrice - o.amountPaid), 0);

  const cards = [
    { label: 'Prihod danas', value: formatPrice(revenueToday) },
    { label: 'Porudžbine primljene danas', value: ordersReceivedToday },
    { label: 'Porudžbine završene danas', value: completedToday },
    { label: 'Neplaćene ili delimično plaćene', value: `${unpaidCount} (${formatPrice(unpaidTotal)})` },
  ];

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-title mb-6">Izveštaji</h1>
        <div className="bg-card rounded-xl shadow-sm shadow-black/5 px-4 py-12 text-center">
          <p className="text-muted-foreground font-medium">Nema podataka za prikaz izveštaja.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Podaci će se prikazati kada budu kreirane prve porudžbine.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-title mb-6">Izveštaji</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-card rounded-xl p-5 shadow-sm shadow-black/5 border-l-4 border-l-primary">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {unpaidOrders.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3">Neplaćene ili delimično plaćene porudžbine</h2>
          <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Br. porudžbine</th>
                    <th className="text-left px-4 py-3 font-medium">Kupac</th>
                    <th className="text-left px-4 py-3 font-medium">Telefon</th>
                    <th className="text-right px-4 py-3 font-medium">Iznos za naplatu</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidOrders.map(order => {
                    const customer = getCustomer(order.customerId);
                    return (
                      <tr key={order.id} onClick={() => navigate(`/porudzbine/${order.id}`)}
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold">{order.orderNumber}</td>
                        <td className="px-4 py-3">{customer?.fullName || '—'}</td>
                        <td className="px-4 py-3">{customer?.phone || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(order.totalPrice - order.amountPaid)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
