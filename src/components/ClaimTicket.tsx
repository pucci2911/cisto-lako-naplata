import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/lib/queries';
import { getSettings } from '@/store/data';
import { formatDate, formatPrice, formatPaymentStatus } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Props {
  orderId: string;
}

export default function ClaimTicket({ orderId }: Props) {
  const { data: order, isLoading } = useQuery(queries.order(orderId));
  const { data: customer } = useQuery(queries.customer(order?.customerId));
  const { data: items = [] } = useQuery(queries.orderItems(order?.id));
  const settings = getSettings();

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Učitavanje...</div>;
  if (!order) return null;
  const amountDue = order.totalPrice - order.amountPaid;

  return (
    <div className="max-w-md mx-auto">
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 8mm; }
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .receipt-wrap { padding: 0 !important; }
          .receipt {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="no-print mb-4 text-center">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer size={16} /> Štampaj
        </Button>
      </div>

      <div className="receipt-wrap p-4">
        <div
          className="receipt bg-white text-black p-6 rounded-xl shadow-sm border mx-auto"
          style={{ fontFamily: '"Courier New", "Lucida Console", ui-monospace, monospace', maxWidth: '380px' }}
        >
          {/* Shop header */}
          <div className="text-center mb-5">
            <h1 className="text-xl font-extrabold uppercase tracking-widest">{settings.shopName || 'Čisto'}</h1>
            {settings.phone && <p className="text-sm mt-1 font-medium">Tel: {settings.phone}</p>}
            {settings.address && <p className="text-xs mt-0.5 text-black/70">{settings.address}</p>}
          </div>

          <div className="border-t-2 border-dashed border-black my-4" />

          {/* Order number */}
          <div className="text-center mb-5">
            <p className="text-[11px] uppercase tracking-wide text-black/60">Broj porudžbine</p>
            <p className="text-3xl font-black tracking-widest mt-1">{order.orderNumber}</p>
            <p className="text-xs mt-1 text-black/70">{formatDate(order.receivedAt)}</p>
          </div>

          <div className="border-t border-dashed border-black/50 my-4" />

          {/* Customer */}
          <div className="text-sm mb-1 leading-relaxed space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">Kupac:</span>
              <span className="text-right">{customer?.fullName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Telefon:</span>
              <span className="text-right">{customer?.phone || '-'}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black/50 my-4" />

          {/* Items */}
          <table className="w-full text-xs mb-1">
            <thead>
              <tr className="border-b border-black/70">
                <th className="text-left py-1.5 font-bold">Artikal</th>
                <th className="text-center py-1.5 font-bold w-8">Kol</th>
                <th className="text-right py-1.5 font-bold w-20">Cena/kom</th>
                <th className="text-right py-1.5 font-bold w-20">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const unitPrice = item.unitPrice + (item.upchargeAmount || 0);
                const lineTotal = unitPrice * item.quantity;
                return (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td className="py-1 align-top">{item.itemName}</td>
                      <td className="py-1 text-center align-top">{item.quantity}</td>
                      <td className="py-1 text-right align-top tabular-nums">{formatPrice(unitPrice)}</td>
                      <td className="py-1 text-right align-top tabular-nums">{formatPrice(lineTotal)}</td>
                    </tr>
                    {item.note && (
                      <tr>
                        <td colSpan={4} className="pb-1.5 text-[10px] italic pl-2 text-black/60">— {item.note}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-dashed border-black/50 my-4" />

          {/* Totals & Payment */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-base font-black">
              <span>UKUPNO:</span>
              <span className="tabular-nums">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Plaćeno:</span>
              <span className="tabular-nums">{formatPrice(order.amountPaid)}</span>
            </div>
            {amountDue > 0 && (
              <div className="flex justify-between font-bold text-black">
                <span>Za naplatu:</span>
                <span className="tabular-nums">{formatPrice(amountDue)}</span>
              </div>
            )}
            <div className="flex justify-between text-black/70">
              <span>Status plaćanja:</span>
              <span>{formatPaymentStatus(order.paymentStatus)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black/50 my-4" />

          {/* Pickup */}
          <div className="text-center mb-2">
            <p className="text-[11px] uppercase tracking-wide text-black/60">Datum preuzimanja</p>
            <p className="text-lg font-bold mt-0.5">{formatDate(order.dueDate)}</p>
          </div>

          <div className="border-t-2 border-dashed border-black my-5" />

          {/* Footer */}
          <div className="text-center text-sm">
            <p className="font-semibold">Hvala na poverenju — Čisto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
