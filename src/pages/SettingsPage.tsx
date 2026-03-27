import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, saveSettings } from '@/store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { ShopSettings, DashboardDisplayMode } from '@/types';

const DISPLAY_OPTIONS: { value: DashboardDisplayMode; label: string; description: string }[] = [
  { value: 'kartice', label: 'Kartice', description: 'Brojčane kartice, po jedna za svaku statistiku' },
  { value: 'pie', label: 'Kružni grafikon', description: 'Prikaz proporcija porudžbina po statusu' },
  { value: 'bar', label: 'Stubičasti grafikon', description: 'Upoređivanje 4 statistike jedna pored druge' },
  { value: 'line', label: 'Linijski grafikon', description: 'Broj porudžbina po danu za poslednjih 7 dana' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(getSettings());
  const [saving, setSaving] = useState(false);

  const update = (field: keyof ShopSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    try {
      saveSettings(settings);
      toast.success('Podešavanja su sačuvana.');
    } catch {
      toast.error('Greška pri čuvanju podešavanja. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-title mb-6">Podešavanja</h1>
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 space-y-4">
        <div><Label className="text-sm">Naziv radnje</Label><Input value={settings.shopName} onChange={e => update('shopName', e.target.value)} className="h-11" /></div>
        <div><Label className="text-sm">Adresa</Label><Input value={settings.address} onChange={e => update('address', e.target.value)} className="h-11" /></div>
        <div><Label className="text-sm">Telefon</Label><Input value={settings.phone} onChange={e => update('phone', e.target.value)} className="h-11" /></div>
        <div><Label className="text-sm">Email radnje</Label><Input value={settings.email} onChange={e => update('email', e.target.value)} className="h-11" /></div>
        <div><Label className="text-sm">Podrazumevani broj dana za gotovost</Label><Input type="number" min={1} value={settings.defaultTurnaroundDays} onChange={e => update('defaultTurnaroundDays', Number(e.target.value))} className="h-11 w-32" /></div>
        <div><Label className="text-sm">Tekst na dnu računa</Label><Textarea value={settings.receiptFooterText} onChange={e => update('receiptFooterText', e.target.value)} rows={2} /></div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="h-11">{saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mt-6">
        <h2 className="text-lg font-semibold mb-1">Prikaz kontrolne table</h2>
        <p className="text-sm text-muted-foreground mb-4">Izaberite kako se prikazuju statistike na kontrolnoj tabli.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DISPLAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { update('dashboardDisplay', opt.value); }}
              className={`text-left rounded-lg border-2 p-4 transition-all duration-150 ${
                (settings.dashboardDisplay || 'kartice') === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="h-11">{saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mt-6">
        <h2 className="text-lg font-semibold mb-3">Upravljanje zaposlenima</h2>
        <p className="text-sm text-muted-foreground mb-3">Dodajte ili upravljajte nalozima zaposlenih.</p>
        <Link to="/zaposleni" className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Upravljaj zaposlenima
        </Link>
      </div>
    </div>
  );
}
