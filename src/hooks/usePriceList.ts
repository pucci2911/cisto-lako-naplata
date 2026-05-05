import { useCallback, useMemo, useState } from 'react';
import { getPriceList } from '@/store/data';
import type { PriceListItem } from '@/types';

// Price list intentionally remains in localStorage for now.
export function usePriceList() {
  const [items, setItems] = useState<PriceListItem[]>(() => getPriceList());

  const refresh = useCallback(() => {
    setItems(getPriceList());
  }, []);

  const activeItems = useMemo(() => items.filter(p => p.active), [items]);

  const findById = useCallback(
    (id: string) => items.find(p => p.id === id),
    [items]
  );

  return { items, activeItems, refresh, findById };
}
