import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/kontrolna-tabla');
    } else {
      setError('Pogrešan email ili lozinka.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-display text-primary mb-2">Čisto</h1>
          <p className="text-muted-foreground text-body-lg">Hemijsko čišćenje</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-lg shadow-black/5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="demo@cisto.rs" className="h-12 text-base" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Lozinka</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="h-12 text-base" required />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full h-12 text-base font-semibold">Prijavite se</Button>
          <p className="text-xs text-muted-foreground text-center mt-4">Demo: demo@cisto.rs / demo1234</p>
        </form>
      </div>
    </div>
  );
}
