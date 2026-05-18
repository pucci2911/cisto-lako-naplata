import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queries, queryKeys } from '@/lib/queries';
import { updateOrder, getSettings } from '@/store/data';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatDateTime, formatPrice } from '@/lib/format';
import { addAuditEntry } from '@/store/audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClaimTicket from '@/components/ClaimTicket';
import type { Order, OrderStatus } from '@/types';
import { Printer, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showPrint, setShowPrint] = useState(false);
  const [notification, setNotification] = useState('');

  const { data: order, isLoading } = useQuery(queries.order(id));
  const { data: customer } = useQuery(queries.customer(order?.customerId));
  const { data: items = [] } = useQuery(queries.orderItems(order?.id));
  const { data: auditEntries = [] } = useQuery(queries.auditLog(order?.id));
  const settings = getSettings();

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Order>) => updateOrder(id!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.order(id!) });
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog(id!) });
    },
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Učitavanje...</div>;
  if (!order) return <div className="py-12 text-center text-muted-foreground">Porudžbina nije pronađena.</div>;

  const amountDue = order.totalPrice - order.amountPaid;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setNotification('');
    const updates: Partial<Order> = { status: newStatus };
    if (newStatus === 'Preuzeto') {
      updates.pickedUpAt = new Date().toISOString();
      await addAuditEntry(order.id, `Porudžbina preuzeta`);
    }
    if (newStatus === 'Spremno') {
      if (customer?.email) {
        const { error } = await supabase.functions.invoke('send-ready-notification', {
          body: { orderId: order.id, shopName: settings.shopName },
        });
        if (error) {
          setNotification(`Slanje emaila nije uspelo: ${error.message}`);
        } else {
          updates.readyNotificationSentAt = new Date().toISOString();
          setNotification(`Email obaveštenje poslato na ${customer.email}`);
          await addAuditEntry(order.id, `Obaveštenje poslato na ${customer.email}`);
        }
      } else {
        setNotification('Status ažuriran (kupac nema email)');
      }
    }
    await addAuditEntry(order.id, `Status promenjen u: ${newStatus}`);
    updateMutation.mutate(updates);
  };

  const handleFieldUpdate = (field: keyof Order, value: string | number) => {
    if (field === 'paymentStatus') {
      addAuditEntry(order.id, `Status plaćanja promenjen u: ${value}`);
    }
    updateMutation.mutate({ [field]: value } as Partial<Order>);
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

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Status</Label>
            <Select value={order.status} onValueChange={v => handleStatusChange(v as OrderStatus)}>
              <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
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

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Kupac</h2>
        <p className="font-medium text-base">{customer?.fullName}</p>
        <p className="text-muted-foreground">{customer?.phone}</p>
        {customer?.email && <p className="text-muted-foreground">{customer.email}</p>}
      </div>

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
              {item.note && (
                <p className="mt-1 text-sm text-muted-foreground italic">📝 {item.note}</p>
              )}
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

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Istorija promena</h2>
        {auditEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nema zabeleženih promena.</p>
        ) : (
          <div className="space-y-2">
            {auditEntries.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                <span className="text-muted-foreground whitespace-nowrap">{formatDateTime(entry.timestamp)}</span>
                <span>{entry.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
