import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/lib/queries';
import { getSettings } from '@/store/data';
import { formatDate, formatPrice } from '@/lib/format';
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
          @page { size: A5; margin: 10mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .receipt { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="no-print mb-4 text-center">
        <Button onClick={() => window.print()} className="gap-2"><Printer size={16} /> Štampaj</Button>
      </div>

      <div
        className="receipt bg-white text-black p-6 rounded-xl shadow-sm border mx-auto"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace', maxWidth: '380px' }}
      >
        {/* Shop header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold uppercase tracking-wide">{settings.shopName}</h1>
          {settings.address && <p className="text-xs">{settings.address}</p>}
          {settings.phone && <p className="text-xs">Tel: {settings.phone}</p>}
        </div>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Order number */}
        <div className="text-center mb-4">
          <p className="text-xs uppercase">Broj porudžbine</p>
          <p className="text-2xl font-bold tracking-widest">{order.orderNumber}</p>
          <p className="text-xs mt-1">{formatDate(order.receivedAt)}</p>
        </div>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Customer */}
        <div className="text-sm mb-3 leading-relaxed">
          <div className="flex justify-between">
            <span className="font-semibold">Kupac:</span>
            <span className="text-right">{customer?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Telefon:</span>
            <span className="text-right">{customer?.phone}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Items */}
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b border-black/60">
              <th className="text-left py-1 font-semibold">Artikal</th>
              <th className="text-center py-1 font-semibold w-10">Kol.</th>
              <th className="text-right py-1 font-semibold w-20">Cena</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <React.Fragment key={item.id}>
                <tr>
                  <td className="py-1 align-top">{item.itemName}</td>
                  <td className="py-1 text-center align-top">{item.quantity}</td>
                  <td className="py-1 text-right align-top tabular-nums">
                    {formatPrice((item.unitPrice + (item.upchargeAmount || 0)) * item.quantity)}
                  </td>
                </tr>
                {item.note && (
                  <tr>
                    <td colSpan={3} className="pb-1 text-xs italic pl-2">— {item.note}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-base font-bold">
            <span>UKUPNO:</span>
            <span className="tabular-nums">{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Plaćeno:</span>
            <span className="tabular-nums">{formatPrice(order.amountPaid)}</span>
          </div>
          {amountDue > 0 && (
            <div className="flex justify-between font-bold">
              <span>Za naplatu:</span>
              <span className="tabular-nums">{formatPrice(amountDue)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Pickup */}
        <div className="text-sm text-center mb-2">
          <p className="text-xs uppercase">Datum preuzimanja</p>
          <p className="text-base font-bold">{formatDate(order.dueDate)}</p>
        </div>

        <div className="border-t border-dashed border-black/60 my-3" />

        {/* Footer */}
        <div className="text-center text-sm mt-4">
          <p className="font-semibold">Hvala na poverenju.</p>
        </div>
      </div>
    </div>
  );
}
