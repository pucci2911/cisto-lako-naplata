import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Navigate } from 'react-router-dom';
import { Clock, Eye, CreditCard, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/kontrolna-tabla" replace />;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="px-6 py-20 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance leading-[1.1] mb-6">
          Jednostavno vođenje hemijske čistionice
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
          Manje papira, manje grešaka, brži rad. Prijem, statusi, naplata i obaveštenja — na jednom mestu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base transition-colors hover:opacity-90 active:scale-[0.97]"
          >
            Prijavi se
          </button>
          <button
            onClick={() => navigate('/status')}
            className="px-8 py-3.5 rounded-lg border border-border text-foreground font-medium text-base transition-colors hover:bg-muted active:scale-[0.97]"
          >
            Proveri porudžbinu
          </button>
        </div>
      </header>

      {/* Benefits */}
      <section className="px-6 py-16 bg-background">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: 'Brzi prijem',
              desc: 'Porudžbina za manje od 60 sekundi. Bez papirnih listića, bez grešaka.',
            },
            {
              icon: Eye,
              title: 'Uvek znate gde je šta',
              desc: 'Svaki komad odeće ima status. Kupci ne moraju da zovu.',
            },
            {
              icon: CreditCard,
              title: 'Naplata bez gužve',
              desc: 'Evidencija plaćanja, dugovanja i metoda plaćanja na jednom mestu.',
            },
          ].map((b) => (
            <div key={b.title} className="bg-card rounded-xl p-8 shadow-sm shadow-black/5 border border-border/50">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <b.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-14">Kako funkcioniše</h2>
          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Primite porudžbinu',
                desc: 'Unesite kupca i artikle za čišćenje. Sistem generiše broj porudžbine i listić.',
              },
              {
                step: '2',
                title: 'Ažurirajte status',
                desc: 'Kada je porudžbina gotova, promenite status. Kupac dobija email.',
              },
              {
                step: '3',
                title: 'Preuzimanje',
                desc: 'Kupac donosi broj, vi pronalazite za 5 sekundi i naplaćujete.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-background">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Isprobajte besplatno — bez kreditne kartice, bez instalacije.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base transition-colors hover:opacity-90 active:scale-[0.97]"
          >
            Počnite danas <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">© 2026 Čisto. Sva prava zadržana.</p>
      </footer>
    </div>
  );
}
