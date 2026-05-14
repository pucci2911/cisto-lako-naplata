import React, { useState, useMemo } from 'react';
import { usePriceList } from '@/hooks/usePriceList';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function PriceList() {
  const { items, isLoading, create, update } = usePriceList();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; category?: string; price?: string }>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() =>
    [...items].sort((a, b) => {
      const cat = a.category.localeCompare(b.category, 'sr');
      return cat !== 0 ? cat : a.itemName.localeCompare(b.itemName, 'sr');
    }),
    [items]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(i =>
      i.itemName.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Naziv je obavezan';
    if (!category.trim()) e.category = 'Kategorija je obavezna';
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0) e.price = 'Cena mora biti veća od 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await create({ itemName: name.trim(), category: category.trim(), basePrice: Number(price), active: true });
      toast.success('Stavka uspešno dodata.');
      setName(''); setCategory(''); setPrice(''); setErrors({});
      setShowAdd(false);
    } catch {
      toast.error('Nije moguće sačuvati stavku. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await update(id, { active });
    } catch {
      toast.error('Greška pri ažuriranju stavke.');
    }
  };

  const handleEditSave = async (id: string) => {
    if (!validate()) return;
    try {
      await update(id, { itemName: name.trim(), category: category.trim(), basePrice: Number(price) });
      toast.success('Stavka ažurirana.');
      setEditId(null);
    } catch {
      toast.error('Greška pri ažuriranju stavke.');
    }
  };

  const startEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditId(id); setName(item.itemName); setCategory(item.category); setPrice(String(item.basePrice));
    setErrors({});
  };

  const hasSearch = search.trim().length > 0;
  const noResults = hasSearch && filtered.length === 0;
  const noData = items.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title">Cenovnik</h1>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setName(''); setCategory(''); setPrice(''); setErrors({}); setSaving(false); }} className="gap-2">
          <Plus size={16} /> Dodaj stavku
        </Button>
      </div>

      {!noData && (
        <div className="mb-4 relative max-w-sm">
          <Input
            placeholder="Pretraži stavke..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="h-11 pr-9"
          />
          {hasSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Obriši pretragu"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {showAdd && (
        <div className="bg-card rounded-xl p-4 shadow-sm shadow-black/5 mb-4 space-y-3" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}>
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

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {noData && (
          <div className="bg-card rounded-xl p-6 text-center shadow-sm">
            <p className="text-muted-foreground font-medium">Cenovnik je prazan.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Dodajte prvu stavku klikom na dugme iznad.</p>
          </div>
        )}
        {noResults && (
          <div className="bg-card rounded-xl p-6 text-center shadow-sm">
            <p className="text-muted-foreground font-medium">Nema stavki za uneti pojam.</p>
            <button onClick={clearSearch} className="text-sm text-primary hover:underline mt-1">Obriši pretragu</button>
          </div>
        )}
        {paginated.map(item => (
          <div key={item.id} className="bg-card rounded-xl p-4 shadow-sm shadow-black/5">
            {editId === item.id ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Kategorija</Label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} className="h-9" />
                  {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                </div>
                <div>
                  <Label className="text-sm">Naziv</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="h-9" />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label className="text-sm">Cena</Label>
                  <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-9" />
                  {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditSave(item.id)}>Sačuvaj</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditId(null); setErrors({}); }}>Otkaži</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{item.itemName}</div>
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                  <div className="font-semibold tabular-nums mt-1">{formatPrice(item.basePrice)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Aktivno</span>
                    <Switch checked={item.active} onCheckedChange={v => handleToggle(item.id, v)} />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEdit(item.id)}>Izmeni</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
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
              {noData && (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-muted-foreground font-medium">Cenovnik je prazan.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Dodajte prvu stavku klikom na dugme iznad.</p>
                </td></tr>
              )}
              {noResults && (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-muted-foreground font-medium">Nema stavki za uneti pojam.</p>
                  <button onClick={clearSearch} className="text-sm text-primary hover:underline mt-1">Obriši pretragu</button>
                </td></tr>
              )}
              {paginated.map(item => (
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

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 px-1">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="gap-1"
          >
            <ChevronLeft size={14} /> Prethodna
          </Button>
          <span className="text-sm text-muted-foreground">
            Strana {safePage} od {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="gap-1"
          >
            Sledeća <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
