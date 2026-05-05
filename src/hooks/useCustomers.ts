import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saveCustomer } from '@/store/data';
import { queries, queryKeys } from '@/lib/queries';
import type { Customer } from '@/types';

export function useCustomers() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery(queries.customers());
  const customers = useMemo(() => data ?? [], [data]);

  const createMutation = useMutation({
    mutationFn: (input: Omit<Customer, 'id' | 'createdAt'>) => saveCustomer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });

  const create = useCallback(
    (input: Omit<Customer, 'id' | 'createdAt'>) => createMutation.mutateAsync(input),
    [createMutation]
  );

  const search = useCallback(
    (query: string): Customer[] => {
      if (query.length < 2) return [];
      const q = query.toLowerCase();
      return customers.filter(
        c => c.fullName.toLowerCase().includes(q) || c.phone.includes(query)
      );
    },
    [customers]
  );

  return { customers, isLoading, error, refresh: refetch, create, search };
}
