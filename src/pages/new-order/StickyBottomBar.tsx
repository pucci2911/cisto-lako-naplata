import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import type { Customer } from '@/types';

interface Props {
  totalPrice: number;
  selectedCustomer: Customer | null;
  itemsCount: number;
  saving: boolean;
  onSave: () => void;
}

export function StickyBottomBar({ totalPrice, selectedCustomer, itemsCount, saving, onSave }: Props) {
  return (
    <>
      <div className="h-32 md:h-24" />
      <div className="fixed bottom-14 md:bottom-0 md:left-56 left-0 right-0 bg-card border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Ukupno</p>
            <p className="text-xl font-bold tabular-nums">{formatPrice(totalPrice)}</p>
            {!selectedCustomer && itemsCount === 0 && (
              <p className="text-sm text-destructive mt-0.5">Odaberite kupca i dodajte bar jednu stavku da biste nastavili</p>
            )}
            {!selectedCustomer && itemsCount > 0 && (
              <p className="text-sm text-destructive mt-0.5">Odaberite kupca da biste nastavili</p>
            )}
            {selectedCustomer && itemsCount === 0 && (
              <p className="text-sm text-destructive mt-0.5">Dodajte bar jednu stavku da biste nastavili</p>
            )}
          </div>
          <Button
            onClick={onSave}
            disabled={!selectedCustomer || itemsCount === 0 || saving}
            size="lg"
            className="h-14 px-8 text-lg font-semibold shrink-0"
          >
            {saving ? 'Čuvanje...' : 'Kreiraj porudžbinu'}
          </Button>
        </div>
      </div>
    </>
  );
}
