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

const PHONE_REGEX = /^[0-9\s+\-/]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<'shopName' | 'address' | 'phone' | 'email' | 'defaultTurnaroundDays', string>>;

function validate(s: ShopSettings): FieldErrors {
  const errors: FieldErrors = {};
  if (!s.shopName.trim()) errors.shopName = 'Naziv radnje je obavezan';
  if (!s.address.trim()) errors.address = 'Adresa je obavezna';
  const phone = s.phone.trim();
  if (!phone) {
    errors.phone = 'Telefon je obavezan';
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Telefon nije u ispravnom formatu';
  }
  const email = s.email.trim();
  if (!email) {
    errors.email = 'Email je obavezan';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Email nije u ispravnom formatu';
  }
  if (!s.defaultTurnaroundDays || s.defaultTurnaroundDays < 1) {
    errors.defaultTurnaroundDays = 'Broj dana mora biti najmanje 1';
  }
  return errors;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(getSettings());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = (field: keyof ShopSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldErrors]) {
      setErrors(prev => { const n = { ...prev }; delete n[field as keyof FieldErrors]; return n; });
    }
  };

  const handleSave = () => {
    if (saving) return;
    const trimmed: ShopSettings = {
      ...settings,
      shopName: settings.shopName.trim(),
      address: settings.address.trim(),
      phone: settings.phone.trim(),
      email: settings.email.trim(),
      receiptFooterText: settings.receiptFooterText.trim(),
    };
    const errs = validate(trimmed);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Ispravite greške u formi');
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      saveSettings(trimmed);
      setSettings(trimmed);
      toast.success('Podešavanja su sačuvana.');
    } catch {
      toast.error('Greška pri čuvanju podešavanja. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? <p className="text-sm text-destructive mt-1">{errors[key]}</p> : null;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-title mb-6">Podešavanja</h1>
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 space-y-4">
        <div><Label className="text-sm">Naziv radnje</Label><Input value={settings.shopName} onChange={e => update('shopName', e.target.value)} className="h-11" />{fieldError('shopName')}</div>
        <div><Label className="text-sm">Adresa</Label><Input value={settings.address} onChange={e => update('address', e.target.value)} className="h-11" />{fieldError('address')}</div>
        <div><Label className="text-sm">Telefon</Label><Input value={settings.phone} onChange={e => update('phone', e.target.value)} className="h-11" />{fieldError('phone')}</div>
        <div><Label className="text-sm">Email radnje</Label><Input value={settings.email} onChange={e => update('email', e.target.value)} className="h-11" />{fieldError('email')}</div>
        <div><Label className="text-sm">Podrazumevani broj dana za gotovost</Label><Input type="number" value={settings.defaultTurnaroundDays} onChange={e => update('defaultTurnaroundDays', Number(e.target.value))} className="h-11 w-32" />{fieldError('defaultTurnaroundDays')}</div>
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
