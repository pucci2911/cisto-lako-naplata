import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveOrder, saveOrderItem, deleteOrder } from '@/store/data';
import { queryKeys } from '@/lib/queries';
import type { Order, OrderItem } from '@/types';

export function useOrders() {
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (args: {
      orderData: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>;
      items: Array<Omit<OrderItem, 'id' | 'orderId'>>;
    }): Promise<Order> => {
      let order: Order | null = null;
      try {
        order = await saveOrder(args.orderData);
        for (const item of args.items) {
          await saveOrderItem({ ...item, orderId: order.id });
        }
        return order;
      } catch (err) {
        if (order) {
          // Rollback: deleting the order cascades to its items.
          try { await deleteOrder(order.id); } catch { /* best effort */ }
        }
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });

  const createOrder = useCallback(
    (
      orderData: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>,
      items: Array<Omit<OrderItem, 'id' | 'orderId'>>
    ) => createMutation.mutateAsync({ orderData, items }),
    [createMutation]
  );

  return { createOrder, creating: createMutation.isPending };
}
