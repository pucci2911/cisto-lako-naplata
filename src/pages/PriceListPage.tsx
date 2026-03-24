import React, { useState } from 'react';
import { getPriceList, savePriceListItem, updatePriceListItem } from '@/store/data';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PriceList() {
  const [, forceRender] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; category?: string; price?: string }>({});

  const items = getPriceList();

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Naziv je obavezan';
    if (!category.trim()) e.category = 'Kategorija je obavezna';
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0) e.price = 'Cena mora biti veća od 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    setSaving(true);
    try {
      savePriceListItem({ itemName: name.trim(), category: category.trim(), basePrice: Number(price), active: true });
      toast.success('Stavka uspešno dodata.');
      setName(''); setCategory(''); setPrice(''); setErrors({});
      setShowAdd(false);
      forceRender(n => n + 1);
    } catch {
      toast.error('Nije moguće sačuvati stavku. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (id: string, active: boolean) => {
    updatePriceListItem(id, { active });
    forceRender(n => n + 1);
  };

  const handleEditSave = (id: string) => {
    if (!validate()) return;
    updatePriceListItem(id, { itemName: name.trim(), category: category.trim(), basePrice: Number(price) });
    toast.success('Stavka ažurirana.');
    setEditId(null);
    forceRender(n => n + 1);
  };

  const startEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditId(id); setName(item.itemName); setCategory(item.category); setPrice(item.basePrice);
    setErrors({});
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title">Cenovnik</h1>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setName(''); setCategory(''); setPrice(''); setErrors({}); }} className="gap-2">
          <Plus size={16} /> Dodaj stavku
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-xl p-4 shadow-sm shadow-black/5 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Naziv *</Label>
              <Input value={name} onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }} className="h-11" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-sm">Kategorija *</Label>
              <Input value={category} onChange={e => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: undefined })); }} className="h-11" />
              {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <Label className="text-sm">Cena (RSD) *</Label>
              <Input type="number" min={1} value={price} onChange={e => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: undefined })); }} className="h-11" />
              {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setErrors({}); }}>Otkaži</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Kategorija</th>
                <th className="text-left px-4 py-3 font-medium">Naziv</th>
                <th className="text-right px-4 py-3 font-medium">Cena</th>
                <th className="text-center px-4 py-3 font-medium">Aktivno</th>
                <th className="text-right px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b last:border-0">
                  {editId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <Input value={category} onChange={e => setCategory(e.target.value)} className="h-9" />
                        {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                      </td>
                      <td className="px-4 py-2">
                        <Input value={name} onChange={e => setName(e.target.value)} className="h-9" />
                        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                      </td>
                      <td className="px-4 py-2">
                        <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-9 text-right" />
                        {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
                      </td>
                      <td></td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <Button size="sm" onClick={() => handleEditSave(item.id)}>Sačuvaj</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditId(null); setErrors({}); }}>Otkaži</Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                      <td className="px-4 py-3 font-medium">{item.itemName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatPrice(item.basePrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={item.active} onCheckedChange={v => handleToggle(item.id, v)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(item.id)}>Izmeni</Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
