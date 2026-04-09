import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, type Profile } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function StaffPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at');
    if (data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Sva polja su obavezna.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }
    if (saving) return;
    setSaving(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-staff', {
        body: { email: email.trim(), password: password.trim(), name: name.trim() },
      });

      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || 'Greška pri dodavanju.');
        return;
      }

      toast.success('Zaposleni je uspešno dodat.');
      setName(''); setEmail(''); setPassword(''); setShowAdd(false);
      await fetchProfiles();
    } catch {
      toast.error('Greška pri dodavanju zaposlenog.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (profile: Profile) => {
    // Don't allow deactivating yourself
    if (profile.user_id === user?.id) return;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('toggle-staff-active', {
        body: { profileId: profile.id, active: !profile.active },
      });

      if (fnError || data?.error) {
        toast.error(data?.error || 'Greška pri promeni statusa.');
        return;
      }

      await fetchProfiles();
    } catch {
      toast.error('Greška pri promeni statusa.');
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto"><p className="text-muted-foreground py-12 text-center">Učitavanje...</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title">Zaposleni</h1>
        <Button onClick={() => setShowAdd(true)} disabled={showAdd} className="h-11">
          + Dodaj zaposlenog
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">Novi zaposleni</h2>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div><Label className="text-sm">Ime i prezime</Label><Input value={name} onChange={e => setName(e.target.value)} className="h-11" /></div>
          <div><Label className="text-sm">Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-11" /></div>
          <div><Label className="text-sm">Početna lozinka</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-11" /></div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} disabled={saving} className="h-11">{saving ? 'Čuvanje...' : 'Sačuvaj'}</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setName(''); setEmail(''); setPassword(''); setError(''); }} className="h-11">Otkaži</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Ime</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Uloga</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Akcija</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <p className="text-muted-foreground font-medium">Nema zaposlenih.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Dodajte prvog zaposlenog klikom na dugme iznad.</p>
              </td></tr>
            )}
            {profiles.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.email || '—'}</td>
                <td className="px-4 py-3">{p.role === 'owner' ? 'Vlasnik' : 'Zaposleni'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                    {p.active ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.user_id !== user?.id && (
                    <Button variant="outline" size="sm" onClick={() => toggleActive(p)}>
                      {p.active ? 'Deaktiviraj' : 'Aktiviraj'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
