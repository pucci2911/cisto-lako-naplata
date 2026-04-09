import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const err = await login(email, password);
      if (err) {
        setError(err);
      } else {
        navigate('/kontrolna-tabla');
      }
    } finally {
      setLoading(false);
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
              placeholder="vas@email.com" className="h-12 text-base" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Lozinka</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="h-12 text-base pr-11" required />
              <button type="button" tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Za resetovanje lozinke kontaktirajte administratora.</p>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? 'Prijavljivanje...' : 'Prijavite se'}
          </Button>
        </form>
      </div>
    </div>
  );
}
