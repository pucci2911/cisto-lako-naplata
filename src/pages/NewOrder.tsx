import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, saveCustomer, getPriceList, saveOrder, saveOrderItem, getSettings } from '@/store/data';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClaimTicket from '@/components/ClaimTicket';
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer, PaymentMethod, PaymentStatus, OrderItem } from '@/types';

interface DraftItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  upchargeAmount: number;
  note: string;
  stainNotes: string;
  damageNotes: string;
  specialInstructions: string;
  showNotes: boolean;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const settings = getSettings();

  // Customer search
  const [custSearch, setCustSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Items
  const [items, setItems] = useState<DraftItem[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);

  // Order details
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + settings.defaultTurnaroundDays);
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().split('T')[0]);
  const [rackLocation, setRackLocation] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Kes');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Nije placeno');
  const [amountPaid, setAmountPaid] = useState(0);

  // Saved order
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalPrice = items.reduce((sum, i) => sum + (i.unitPrice + i.upchargeAmount) * i.quantity, 0);
  const amountDue = totalPrice - amountPaid;

  // Warn before leaving
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  // Customer search results
  const matchingCustomers = custSearch.length >= 2
    ? getCustomers().filter(c => c.fullName.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch))
    : [];

  const handleAddFromPriceList = (plId: string) => {
    const pl = getPriceList().find(p => p.id === plId);
    if (!pl) return;
    setItems(prev => [...prev, {
      id: crypto.randomUUID(), itemName: pl.itemName, category: pl.category,
      quantity: 1, unitPrice: pl.basePrice, upchargeAmount: 0,
      note: '', stainNotes: '', damageNotes: '', specialInstructions: '', showNotes: false,
    }]);
    markDirty();
  };

  const handleAddManual = () => {
    if (!manualName) return;
    setItems(prev => [...prev, {
      id: crypto.randomUUID(), itemName: manualName, category: manualCategory,
      quantity: manualQty, unitPrice: manualPrice, upchargeAmount: 0,
      note: '', stainNotes: '', damageNotes: '', specialInstructions: '', showNotes: false,
    }]);
    setManualName(''); setManualCategory(''); setManualQty(1); setManualPrice(0);
    setShowManualForm(false);
    markDirty();
  };

  const handleRemoveItem = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); markDirty(); };

  const updateItem = (id: string, field: keyof DraftItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    markDirty();
  };

  const handleCreateCustomer = () => {
    if (!newCustName || !newCustPhone) return;
    const c = saveCustomer({ fullName: newCustName, phone: newCustPhone, email: newCustEmail || undefined, preferredNotificationChannel: newCustEmail ? 'email' : 'none' });
    setSelectedCustomer(c);
    setShowNewCustForm(false);
    markDirty();
  };

  const handleSave = () => {
    if (!selectedCustomer || items.length === 0 || saving) return;
    setSaving(true);
    try {
      const order = saveOrder({
        customerId: selectedCustomer.id,
        dueDate, status: 'Primljeno',
        paymentStatus, paymentMethod,
        totalPrice, amountPaid,
        rackLocation: rackLocation || undefined,
        internalNotes: internalNotes || undefined,
        customerNote: customerNote || undefined,
      });
      items.forEach(item => {
        saveOrderItem({
          orderId: order.id, itemName: item.itemName, category: item.category,
          quantity: item.quantity, unitPrice: item.unitPrice,
          upchargeAmount: item.upchargeAmount || undefined,
          note: item.note || undefined,
          stainNotes: item.stainNotes || undefined,
          damageNotes: item.damageNotes || undefined,
          specialInstructions: item.specialInstructions || undefined,
          itemStatus: 'Na cekanju',
        });
      });
      setIsDirty(false);
      toast.success('Porudžbina uspešno kreirana.');
      setSavedOrderId(order.id);
    } catch {
      toast.error('Greška pri kreiranju porudžbine. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  };

  if (savedOrderId) {
    return (
      <div>
        <div className="mb-4 no-print flex gap-2">
          <Button variant="outline" onClick={() => navigate('/porudzbine')}>← Lista porudžbina</Button>
          <Button variant="outline" onClick={() => navigate('/kontrolna-tabla')}>Kontrolna tabla</Button>
        </div>
        <ClaimTicket orderId={savedOrderId} />
      </div>
    );
  }

  const activePriceList = getPriceList().filter(p => p.active);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-title mb-6">Nova porudžbina</h1>

      {/* Step 1: Customer */}
      <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Kupac</h2>
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-muted rounded-lg p-4">
            <div>
              <p className="font-semibold text-base">{selectedCustomer.fullName}</p>
              <p className="text-muted-foreground">{selectedCustomer.phone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(null); setCustSearch(''); }}>Promeni</Button>
          </div>
        ) : (
          <div>
            <Input placeholder="Pretražite kupca po broju telefona ili imenu" value={custSearch} onChange={e => { setCustSearch(e.target.value); setShowNewCustForm(false); }}
              className="h-12 text-base mb-2" />
            {matchingCustomers.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {matchingCustomers.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustSearch(''); markDirty(); }}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors">
                    <span className="font-medium">{c.fullName}</span>
                    <span className="text-muted-foreground ml-3">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {custSearch.length >= 2 && matchingCustomers.length === 0 && !showNewCustForm && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">Kupac nije pronađen.</p>
                <Button variant="outline" onClick={() => setShowNewCustForm(true)}>
                  <Plus size={16} className="mr-1" /> Dodaj novog kupca
                </Button>
              </div>
            )}
            {showNewCustForm && (
              <div className="border rounded-lg p-4 mt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Ime i prezime *</Label>
                    <Input value={newCustName} onChange={e => setNewCustName(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <Label className="text-sm">Telefon *</Label>
                    <Input value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} className="h-11" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Email (opciono)</Label>
                  <Input value={newCustEmail} onChange={e => setNewCustEmail(e.target.value)} className="h-11" />
                </div>
                <Button onClick={handleCreateCustomer} disabled={!newCustName || !newCustPhone}>Sačuvaj kupca</Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 2: Items */}
      <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Artikli</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <Select onValueChange={handleAddFromPriceList}>
            <SelectTrigger className="w-64 h-11">
              <SelectValue placeholder="Dodaj artikal iz cenovnika" />
            </SelectTrigger>
            <SelectContent>
              {activePriceList.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.itemName} — {formatPrice(p.basePrice)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowManualForm(!showManualForm)} className="h-11">
            Dodaj artikal ručno
          </Button>
        </div>

        {showManualForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm">Naziv</Label>
                <Input value={manualName} onChange={e => setManualName(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-sm">Kategorija</Label>
                <Input value={manualCategory} onChange={e => setManualCategory(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-sm">Količina</Label>
                <Input type="number" min={1} value={manualQty} onChange={e => setManualQty(Number(e.target.value))} className="h-10" />
              </div>
              <div>
                <Label className="text-sm">Cena (RSD)</Label>
                <Input type="number" min={0} value={manualPrice} onChange={e => setManualPrice(Number(e.target.value))} className="h-10" />
              </div>
            </div>
            <Button size="sm" onClick={handleAddManual} disabled={!manualName}>Dodaj</Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium">{item.itemName}</span>
                    <span className="text-muted-foreground text-sm ml-2">×{item.quantity}</span>
                    <span className="text-sm ml-2">{formatPrice(item.unitPrice)}</span>
                    {item.upchargeAmount > 0 && <span className="text-sm text-warning ml-1">+{formatPrice(item.upchargeAmount)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={item.upchargeAmount} onChange={e => updateItem(item.id, 'upchargeAmount', Number(e.target.value))}
                      className="w-24 h-8 text-sm" placeholder="Doplata" />
                    <button onClick={() => updateItem(item.id, 'showNotes', !item.showNotes)} className="p-1 text-muted-foreground hover:text-foreground">
                      {item.showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-destructive hover:text-destructive/80">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <Input value={item.note} onChange={e => updateItem(item.id, 'note', e.target.value)}
                    className="h-8 text-sm" placeholder="Napomena (npr. fali dugme, fleka na rukavu...)" />
                </div>
                {item.showNotes && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Fleke</Label>
                      <Input value={item.stainNotes} onChange={e => updateItem(item.id, 'stainNotes', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Oštećenja</Label>
                      <Input value={item.damageNotes} onChange={e => updateItem(item.id, 'damageNotes', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Posebne instrukcije</Label>
                      <Input value={item.specialInstructions} onChange={e => updateItem(item.id, 'specialInstructions', e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="text-right text-lg font-bold pt-2">Ukupno: {formatPrice(totalPrice)}</div>
          </div>
        )}
      </section>

      {/* Step 3: Details */}
      <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-4">3. Detalji</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Datum preuzimanja</Label>
            <Input type="date" value={dueDate} onChange={e => { setDueDate(e.target.value); markDirty(); }} className="h-11" />
          </div>
          <div>
            <Label className="text-sm">Lokacija u prodavnici</Label>
            <Input value={rackLocation} onChange={e => { setRackLocation(e.target.value); markDirty(); }} placeholder="npr. A3" className="h-11" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm">Napomena za kupca</Label>
            <Textarea value={customerNote} onChange={e => { setCustomerNote(e.target.value); markDirty(); }} rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm">Interna napomena</Label>
            <Textarea value={internalNotes} onChange={e => { setInternalNotes(e.target.value); markDirty(); }} rows={2} />
          </div>
        </div>
      </section>

      {/* Step 4: Payment */}
      <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
        <h2 className="text-lg font-semibold mb-4">4. Plaćanje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Način plaćanja</Label>
            <Select value={paymentMethod} onValueChange={v => { setPaymentMethod(v as PaymentMethod); markDirty(); }}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Kes">Keš</SelectItem>
                <SelectItem value="Kartica">Kartica</SelectItem>
                <SelectItem value="Kombinovano">Kombinovano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Status plaćanja</Label>
            <Select value={paymentStatus} onValueChange={v => { setPaymentStatus(v as PaymentStatus); markDirty(); }}>
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
            <Input type="number" min={0} value={amountPaid} onChange={e => { setAmountPaid(Number(e.target.value)); markDirty(); }} className="h-11" />
          </div>
          <div>
            <Label className="text-sm">Iznos za naplatu</Label>
            <p className="h-11 flex items-center text-lg font-bold">{formatPrice(amountDue)}</p>
          </div>
        </div>
      </section>

      {/* Spacer so sticky bar doesn't cover content */}
      <div className="h-32 md:h-24" />

      {/* Sticky bottom bar - offset for sidebar on desktop, above mobile nav on mobile */}
      <div className="fixed bottom-14 md:bottom-0 md:left-56 left-0 right-0 bg-card border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Ukupno</p>
            <p className="text-xl font-bold tabular-nums">{formatPrice(totalPrice)}</p>
            {!selectedCustomer && items.length === 0 && (
              <p className="text-sm text-destructive mt-0.5">Odaberite kupca i dodajte bar jednu stavku da biste nastavili</p>
            )}
            {!selectedCustomer && items.length > 0 && (
              <p className="text-sm text-destructive mt-0.5">Odaberite kupca da biste nastavili</p>
            )}
            {selectedCustomer && items.length === 0 && (
              <p className="text-sm text-destructive mt-0.5">Dodajte bar jednu stavku da biste nastavili</p>
            )}
          </div>
          <Button onClick={handleSave} disabled={!selectedCustomer || items.length === 0 || saving}
            size="lg" className="h-14 px-8 text-lg font-semibold shrink-0">
            {saving ? 'Čuvanje...' : 'Kreiraj porudžbinu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
