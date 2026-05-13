import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { LayoutDashboard, ClipboardList, Users, Tag, Settings, LogOut, BarChart3, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/kontrolna-tabla', label: 'Kontrolna tabla', icon: LayoutDashboard },
  { to: '/porudzbine', label: 'Porudžbine', icon: ClipboardList },
  { to: '/kupci', label: 'Kupci', icon: Users },
  { to: '/cenovnik', label: 'Cenovnik', icon: Tag, ownerOnly: true },
  { to: '/izvestaji', label: 'Izveštaji', icon: BarChart3, ownerOnly: true },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth();
  const location = useLocation();
  return (
    <div className="p-4 space-y-1">
      {navItems.map(item => {
        if ((item as any).ownerOnly && profile?.role === 'employee') return null;
        const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
        return (
          <Link key={item.to} to={item.to} onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-3 min-h-11 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
      {profile?.role === 'owner' && (
        <Link to="/podesavanja" onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-3 min-h-11 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/podesavanja' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
          <Settings size={18} />
          Podešavanja
        </Link>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b sticky top-0 z-30 no-print">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-foreground" aria-label="Otvori meni">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-title font-bold text-primary">Čisto</span>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-muted" aria-label="Zatvori meni">
                    <X size={20} />
                  </button>
                </div>
                <NavList onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <Link to="/kontrolna-tabla" className="text-title font-bold text-primary tracking-tight">Čisto</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.name}</span>
            <button onClick={handleLogout} className="p-2 min-h-11 min-w-11 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center" title="Odjavi se">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 bg-card border-r hidden md:block no-print shrink-0">
          <NavList />
        </nav>

        <main className="flex-1">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
