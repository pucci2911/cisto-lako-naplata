import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getCustomer } from '@/store/data';
import { isToday, formatPrice, formatDate } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfMonth, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

type Period = 'danas' | '7dana' | 'mesec';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'danas', label: 'Danas' },
  { value: '7dana', label: 'Poslednjih 7 dana' },
  { value: 'mesec', label: 'Ovaj mesec' },
];

function isInPeriod(dateStr: string, period: Period): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === 'danas') {
    return isToday(dateStr);
  }
  if (period === '7dana') {
    const sevenAgo = startOfDay(subDays(now, 6));
    return d >= sevenAgo && d <= endOfDay(now);
  }
  // mesec
  const monthStart = startOfMonth(now);
  return d >= monthStart && d <= endOfDay(now);
}

function getDaysForPeriod(period: Period): string[] {
  const now = new Date();
  const days: string[] = [];
  if (period === 'danas') {
    days.push(format(now, 'dd.MM'));
  } else if (period === '7dana') {
    for (let i = 6; i >= 0; i--) {
      days.push(format(subDays(now, i), 'dd.MM'));
    }
  } else {
    const monthStart = startOfMonth(now);
    const d = new Date(monthStart);
    while (d <= now) {
      days.push(format(d, 'dd.MM'));
      d.setDate(d.getDate() + 1);
    }
  }
  return days;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const orders = getOrders();
  const [period, setPeriod] = useState<Period>('mesec');

  const filtered = useMemo(() => orders.filter(o => isInPeriod(o.receivedAt, period)), [orders, period]);

  const revenueTotal = filtered.reduce((sum, o) => sum + o.amountPaid, 0);
  const ordersReceived = filtered.length;
  const completedCount = orders.filter(o => o.status === 'Preuzeto' && o.pickedUpAt && isInPeriod(o.pickedUpAt, period)).length;

  // Unpaid — NOT filtered by period
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'Nije placeno' || o.paymentStatus === 'Delimicno placeno');
  const unpaidCount = unpaidOrders.length;
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + (o.totalPrice - o.amountPaid), 0);

  const cards = [
    { label: 'Prihod', value: formatPrice(revenueTotal) },
    { label: 'Porudžbine primljene', value: ordersReceived },
    { label: 'Porudžbine završene', value: completedCount },
    { label: 'Neplaćene ili delimično plaćene', value: `${unpaidCount} (${formatPrice(unpaidTotal)})` },
  ];

  // Chart data
  const chartData = useMemo(() => {
    const days = getDaysForPeriod(period);
    const map: Record<string, number> = {};
    days.forEach(d => { map[d] = 0; });
    filtered.forEach(o => {
      const key = format(new Date(o.receivedAt), 'dd.MM');
      if (key in map) {
        map[key] += o.amountPaid;
      }
    });
    return days.map(d => ({ date: d, prihod: map[d] }));
  }, [filtered, period]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-title">Izveštaji</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.label} className="bg-card rounded-xl p-5 shadow-sm shadow-black/5 border-l-4 border-l-primary">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Prihod po danima</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={period === 'danas' ? 64 : undefined}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatPrice(v)} labelFormatter={l => `Dan: ${l}`} />
            <Bar dataKey="prihod" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Prihod" />
          </BarChart>
        </ResponsiveContainer>
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
