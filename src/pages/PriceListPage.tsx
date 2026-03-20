import React, { useState } from 'react';
import { getPriceList, savePriceListItem, updatePriceListItem } from '@/store/data';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

export default function PriceList() {
  const [, forceRender] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);

  const items = getPriceList();

  const handleAdd = () => {
    if (!name || !category) return;
    savePriceListItem({ itemName: name, category, basePrice: price, active: true });
    setName(''); setCategory(''); setPrice(0); setShowAdd(false);
    forceRender(n => n + 1);
  };

  const handleToggle = (id: string, active: boolean) => {
    updatePriceListItem(id, { active });
    forceRender(n => n + 1);
  };

  const handleEditSave = (id: string) => {
    updatePriceListItem(id, { itemName: name, category, basePrice: price });
    setEditId(null);
    forceRender(n => n + 1);
  };

  const startEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditId(id); setName(item.itemName); setCategory(item.category); setPrice(item.basePrice);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title">Cenovnik</h1>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setName(''); setCategory(''); setPrice(0); }} className="gap-2">
          <Plus size={16} /> Dodaj stavku
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-xl p-4 shadow-sm shadow-black/5 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label className="text-sm">Naziv</Label><Input value={name} onChange={e => setName(e.target.value)} className="h-11" /></div>
            <div><Label className="text-sm">Kategorija</Label><Input value={category} onChange={e => setCategory(e.target.value)} className="h-11" /></div>
            <div><Label className="text-sm">Cena (RSD)</Label><Input type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))} className="h-11" /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!name || !category}>Sačuvaj</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Otkaži</Button>
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
                      <td className="px-4 py-2"><Input value={category} onChange={e => setCategory(e.target.value)} className="h-9" /></td>
                      <td className="px-4 py-2"><Input value={name} onChange={e => setName(e.target.value)} className="h-9" /></td>
                      <td className="px-4 py-2"><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="h-9 text-right" /></td>
                      <td></td>
                      <td className="px-4 py-2 text-right">
                        <Button size="sm" onClick={() => handleEditSave(item.id)}>Sačuvaj</Button>
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
