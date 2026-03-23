import React from 'react';
import { getOrder, getCustomer, getOrderItems, getSettings } from '@/store/data';
import { formatDate, formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Props {
  orderId: string;
}

export default function ClaimTicket({ orderId }: Props) {
  const order = getOrder(orderId);
  const settings = getSettings();
  if (!order) return null;
  const customer = getCustomer(order.customerId);
  const items = getOrderItems(order.id);
  const amountDue = order.totalPrice - order.amountPaid;

  return (
    <div className="max-w-lg mx-auto">
      <div className="no-print mb-4 text-center">
        <Button onClick={() => window.print()} className="gap-2"><Printer size={16} /> Štampaj</Button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-xl font-bold">{settings.shopName}</h1>
          <p className="text-sm text-gray-600">{settings.address}</p>
          <p className="text-sm text-gray-600">{settings.phone}</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-bold font-mono tracking-wider">{order.orderNumber}</p>
        </div>

        <div className="mb-4 text-sm">
          <p><strong>Kupac:</strong> {customer?.fullName}</p>
          <p><strong>Telefon:</strong> {customer?.phone}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Artikal</th>
              <th className="text-center py-1">Kol.</th>
              <th className="text-right py-1">Cena</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-dashed">
                  <td className="py-1">{item.itemName}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">{formatPrice((item.unitPrice + (item.upchargeAmount || 0)) * item.quantity)}</td>
                </tr>
                {item.note && (
                  <tr>
                    <td colSpan={3} className="py-0 pb-1 text-xs text-gray-500 italic pl-2">📝 {item.note}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between font-bold text-base">
            <span>Ukupno:</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Plaćeno:</span>
            <span>{formatPrice(order.amountPaid)}</span>
          </div>
          {amountDue > 0 && (
            <div className="flex justify-between font-bold">
              <span>Za naplatu:</span>
              <span>{formatPrice(amountDue)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t text-sm">
          <p><strong>Datum preuzimanja:</strong> {formatDate(order.dueDate)}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>

        <div className="mt-6 pt-3 border-t text-center text-xs text-gray-500">
          <p>{settings.receiptFooterText}</p>
        </div>
      </div>
    </div>
  );
}
