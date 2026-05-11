import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savePriceListItem, updatePriceListItem } from '@/store/data';
import { queries, queryKeys } from '@/lib/queries';
import type { PriceListItem } from '@/types';

export function usePriceList() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery(queries.priceList());
  const items = useMemo(() => data ?? [], [data]);
  const activeItems = useMemo(() => items.filter(p => p.active), [items]);

  const createMutation = useMutation({
    mutationFn: (input: Omit<PriceListItem, 'id'>) => savePriceListItem(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.priceList }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PriceListItem> }) =>
      updatePriceListItem(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.priceList }),
  });

  const create = useCallback(
    (input: Omit<PriceListItem, 'id'>) => createMutation.mutateAsync(input),
    [createMutation]
  );

  const update = useCallback(
    (id: string, updates: Partial<PriceListItem>) => updateMutation.mutateAsync({ id, updates }),
    [updateMutation]
  );

  const findById = useCallback(
    (id: string) => items.find(p => p.id === id),
    [items]
  );

  return { items, activeItems, isLoading, error, refresh: refetch, create, update, findById };
}
