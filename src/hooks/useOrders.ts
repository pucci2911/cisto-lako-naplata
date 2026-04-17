import { useCallback } from 'react';
import { saveOrder, saveOrderItem } from '@/store/data';
import type { Order, OrderItem } from '@/types';

export function useOrders() {
  const createOrder = useCallback(
    (
      orderData: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>,
      items: Array<Omit<OrderItem, 'id' | 'orderId'>>
    ): Order => {
      const order = saveOrder(orderData);
      items.forEach(item => {
        saveOrderItem({ ...item, orderId: order.id });
      });
      return order;
    },
    []
  );

  return { createOrder };
}
