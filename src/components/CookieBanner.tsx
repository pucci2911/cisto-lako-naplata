import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const handleChoice = (choice: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 no-print">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Ovaj sajt koristi kolačiće za poboljšanje korisničkog iskustva.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleChoice('rejected')}>
            Odbij
          </Button>
          <Button size="sm" onClick={() => handleChoice('accepted')}>
            Prihvati sve
          </Button>
        </div>
      </div>
    </div>
  );
}
