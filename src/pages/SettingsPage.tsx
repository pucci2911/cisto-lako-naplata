import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, saveSettings } from '@/store/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ShopSettings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const update = (field: keyof ShopSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
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
          <Button onClick={handleSave} className="h-11">Sačuvaj podešavanja</Button>
          {saved && <span className="text-sm text-success">Sačuvano!</span>}
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
