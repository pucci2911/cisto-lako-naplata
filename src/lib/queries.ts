import { getCustomers, getCustomer, getOrders, getOrder, getOrderItems, getPriceList } from '@/store/data';

export const queryKeys = {
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  orderItems: (orderId: string) => ['order_items', orderId] as const,
  priceList: ['price_list'] as const,
};

export const queries = {
  customers: () => ({ queryKey: queryKeys.customers, queryFn: getCustomers }),
  customer: (id: string | undefined) => ({
    queryKey: queryKeys.customer(id ?? ''),
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  }),
  orders: () => ({ queryKey: queryKeys.orders, queryFn: getOrders }),
  order: (id: string | undefined) => ({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: () => getOrder(id!),
    enabled: !!id,
  }),
  orderItems: (orderId: string | undefined) => ({
    queryKey: queryKeys.orderItems(orderId ?? ''),
    queryFn: () => getOrderItems(orderId!),
    enabled: !!orderId,
  }),
  priceList: () => ({ queryKey: queryKeys.priceList, queryFn: getPriceList }),
};
