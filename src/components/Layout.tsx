import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { LayoutDashboard, ClipboardList, Users, Tag, Settings, LogOut, BarChart3 } from 'lucide-react';

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

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b sticky top-0 z-30 no-print">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="text-title font-bold text-primary tracking-tight">Čisto</Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-muted text-muted-foreground" title="Odjavi se">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 bg-card border-r hidden md:block no-print shrink-0">
          <div className="p-4 space-y-1">
            {navItems.map(item => {
              if ((item as any).ownerOnly && user?.role === 'employee') return null;
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            {user?.role === 'owner' && (
              <Link to="/podesavanja"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/podesavanja' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
                <Settings size={18} />
                Podešavanja
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-30 no-print">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 4).map(item => {
              if ((item as any).ownerOnly && user?.role === 'employee') return null;
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  <item.icon size={20} />
                  <span className="truncate max-w-[4rem]">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 pb-20 md:pb-0">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
