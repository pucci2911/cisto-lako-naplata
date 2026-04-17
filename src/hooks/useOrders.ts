import { useCallback } from 'react';
import { saveOrder, saveOrderItem, deleteOrderItem } from '@/store/data';
import type { Order, OrderItem } from '@/types';

const ORDERS_KEY = 'cisto_orders';

function rollbackOrder(orderId: string, savedItemIds: string[]) {
  // Remove any items that were successfully saved before the failure
  savedItemIds.forEach(id => {
    try {
      deleteOrderItem(id);
    } catch {
      // best-effort cleanup
    }
  });
  // Remove the order itself directly from localStorage
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const all: Order[] = JSON.parse(raw);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(all.filter(o => o.id !== orderId)));
    }
  } catch {
    // best-effort cleanup
  }
}

export function useOrders() {
  const createOrder = useCallback(
    (
      orderData: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'>,
      items: Array<Omit<OrderItem, 'id' | 'orderId'>>
    ): Order => {
      let order: Order | null = null;
      const savedItemIds: string[] = [];

      try {
        order = saveOrder(orderData);
        items.forEach(item => {
          const saved = saveOrderItem({ ...item, orderId: order!.id });
          savedItemIds.push(saved.id);
        });
        return order;
      } catch (err) {
        if (order) {
          rollbackOrder(order.id, savedItemIds);
        }
        throw err;
      }
    },
    []
  );

  return { createOrder };
}
