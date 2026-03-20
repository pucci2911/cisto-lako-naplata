import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, getCustomer, getOrderItems, updateOrder, updateOrderItem, getSettings } from '@/store/data';
import { formatDate, formatDateTime, formatPrice, statusColor, paymentStatusColor } from '@/lib/format';
import { addAuditEntry, getAuditEntries } from '@/store/audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClaimTicket from '@/components/ClaimTicket';
import type { OrderStatus, PaymentStatus } from '@/types';
import { Printer, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPrint, setShowPrint] = useState(false);
  const [notification, setNotification] = useState('');
  const [, forceRender] = useState(0);

  const order = getOrder(id!);
  if (!order) return <div className="py-12 text-center text-muted-foreground">Porudžbina nije pronađena.</div>;

  const customer = getCustomer(order.customerId);
  const items = getOrderItems(order.id);
  const settings = getSettings();
  const amountDue = order.totalPrice - order.amountPaid;

  const handleStatusChange = (newStatus: OrderStatus) => {
    const updates: Partial<typeof order> = { status: newStatus };
    if (newStatus === 'Preuzeto') updates.pickedUpAt = new Date().toISOString();
    if (newStatus === 'Spremno' && customer?.email) {
      // Simulate sending email
      updates.readyNotificationSentAt = new Date().toISOString();
      setNotification(`Email obaveštenje poslato na ${customer.email}`);
    } else if (newStatus === 'Spremno' && !customer?.email) {
      setNotification('Kupac nema email adresu. Obavestite ga telefonom.');
    }
    updateOrder(order.id, updates);
    forceRender(n => n + 1);
  };

  const handleFieldUpdate = (field: string, value: any) => {
    updateOrder(order.id, { [field]: value });
    forceRender(n => n + 1);
  };

  if (showPrint) {
    return (
      <div>
        <div className="mb-4 no-print">
          <Button variant="outline" onClick={() => setShowPrint(false)}>← Nazad</Button>
        </div>
        <ClaimTicket orderId={order.id} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
          <h1 className="text-title font-mono">{order.orderNumber}</h1>
        </div>
        <Button variant="outline" onClick={() => setShowPrint(true)} className="gap-2">
          <Printer size={16} /> Štampaj
        </Button>
      </div>

      {notification && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${notification.includes('nema') ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
          {notification.includes('nema') ? <AlertTriangle size={16} /> : <Mail size={16} />}
          {notification}
        </div>
      )}

      {order.readyNotificationSentAt && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm flex items-center gap-2">
          <Mail size={16} /> Obaveštenje poslato {formatDateTime(order.readyNotificationSentAt)}
        </div>
      )}

      {/* Status & Key Info */}
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Status</Label>
            <Select value={order.status} onValueChange={v => handleStatusChange(v as OrderStatus)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['Primljeno', 'U obradi', 'Spremno', 'Preuzeto', 'Otkazano'] as OrderStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Lokacija</Label>
            <Input value={order.rackLocation || ''} onChange={e => handleFieldUpdate('rackLocation', e.target.value)}
              className="h-12 text-base" placeholder="npr. A3" />
          </div>
          <div>
            <Label className="text-sm">Datum preuzimanja</Label>
            <p className="text-base font-medium py-2">{formatDate(order.dueDate)}</p>
          </div>
          <div>
            <Label className="text-sm">Primljeno</Label>
            <p className="text-base py-2">{formatDateTime(order.receivedAt)}</p>
          </div>
          {order.pickedUpAt && (
            <div className="sm:col-span-2">
              <Label className="text-sm">Preuzeto</Label>
              <p className="text-base py-2">{formatDateTime(order.pickedUpAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer */}
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Kupac</h2>
        <p className="font-medium text-base">{customer?.fullName}</p>
        <p className="text-muted-foreground">{customer?.phone}</p>
        {customer?.email && <p className="text-muted-foreground">{customer.email}</p>}
      </div>

      {/* Items */}
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Artikli</h2>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.itemName}</span>
                  <span className="text-muted-foreground text-sm ml-2">×{item.quantity}</span>
                  <span className="text-sm ml-2">{formatPrice(item.unitPrice)}</span>
                  {item.upchargeAmount ? <span className="text-sm text-warning ml-1">+{formatPrice(item.upchargeAmount)}</span> : null}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.itemStatus === 'Gotovo' ? 'bg-green-100 text-green-800' : item.itemStatus === 'U obradi' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                  {item.itemStatus}
                </span>
              </div>
              {(item.stainNotes || item.damageNotes || item.specialInstructions) && (
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  {item.stainNotes && <p>Fleke: {item.stainNotes}</p>}
                  {item.damageNotes && <p>Oštećenja: {item.damageNotes}</p>}
                  {item.specialInstructions && <p>Instrukcije: {item.specialInstructions}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-right text-lg font-bold pt-3">Ukupno: {formatPrice(order.totalPrice)}</div>
      </div>

      {/* Payment */}
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Plaćanje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Status plaćanja</Label>
            <Select value={order.paymentStatus} onValueChange={v => handleFieldUpdate('paymentStatus', v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Nije placeno">Nije plaćeno</SelectItem>
                <SelectItem value="Delimicno placeno">Delimično plaćeno</SelectItem>
                <SelectItem value="Placeno">Plaćeno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Iznos plaćen (RSD)</Label>
            <Input type="number" min={0} value={order.amountPaid}
              onChange={e => handleFieldUpdate('amountPaid', Number(e.target.value))} className="h-11" />
          </div>
          <div>
            <Label className="text-sm">Način plaćanja</Label>
            <p className="py-2">{order.paymentMethod}</p>
          </div>
          <div>
            <Label className="text-sm">Iznos za naplatu</Label>
            <p className="py-2 text-lg font-bold">{formatPrice(amountDue)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Napomene</h2>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Napomena za kupca</Label>
            <p className="text-sm py-1">{order.customerNote || '—'}</p>
          </div>
          <div>
            <Label className="text-sm">Interna napomena</Label>
            <Textarea value={order.internalNotes || ''} onChange={e => handleFieldUpdate('internalNotes', e.target.value)} rows={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
