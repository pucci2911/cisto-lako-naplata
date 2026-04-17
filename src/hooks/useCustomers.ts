import { useCallback, useState } from 'react';
import { getCustomers, saveCustomer } from '@/store/data';
import type { Customer } from '@/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());

  const refresh = useCallback(() => {
    setCustomers(getCustomers());
  }, []);

  const create = useCallback((data: Omit<Customer, 'id' | 'createdAt'>) => {
    const c = saveCustomer(data);
    setCustomers(prev => [...prev, c]);
    return c;
  }, []);

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

  return { customers, refresh, create, search };
}
