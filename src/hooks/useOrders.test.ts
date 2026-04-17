import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrders } from './useOrders';
import * as store from '@/store/data';
import type { Order, OrderItem } from '@/types';

const ORDERS_KEY = 'cisto_orders';

const baseOrderData: Omit<Order, 'id' | 'orderNumber' | 'receivedAt'> = {
  customerId: 'cust-1',
  dueDate: '2026-01-01',
  status: 'Primljeno',
  paymentStatus: 'Nije placeno',
  paymentMethod: 'Kes',
  totalPrice: 1000,
  amountPaid: 0,
};

const baseItem: Omit<OrderItem, 'id' | 'orderId'> = {
  itemName: 'Košulja',
  category: 'Gornji deo',
  quantity: 1,
  unitPrice: 350,
  itemStatus: 'Na cekanju',
};

describe('useOrders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns the saved order on success', () => {
    const { result } = renderHook(() => useOrders());

    let created: Order | undefined;
    act(() => {
      created = result.current.createOrder(baseOrderData, [baseItem, baseItem]);
    });

    expect(created).toBeDefined();
    expect(created!.id).toBeTruthy();
    expect(created!.orderNumber).toMatch(/^HC-\d{6}$/);

    const stored: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(created!.id);

    const items: OrderItem[] = JSON.parse(localStorage.getItem('cisto_orderItems') || '[]');
    expect(items).toHaveLength(2);
    expect(items.every(i => i.orderId === created!.id)).toBe(true);
  });

  it('rolls back the order from localStorage when an item save fails', () => {
    let calls = 0;
    const realSaveItem = store.saveOrderItem;
    const spy = vi.spyOn(store, 'saveOrderItem').mockImplementation(item => {
      calls++;
      if (calls === 2) throw new Error('item save failed');
      return realSaveItem(item);
    });

    const { result } = renderHook(() => useOrders());

    expect(() => {
      result.current.createOrder(baseOrderData, [baseItem, baseItem, baseItem]);
    }).toThrow('item save failed');

    const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    expect(orders).toHaveLength(0);

    const items: OrderItem[] = JSON.parse(localStorage.getItem('cisto_orderItems') || '[]');
    expect(items).toHaveLength(0);

    spy.mockRestore();
  });

  it('rethrows the original error to the caller', () => {
    const err = new Error('boom');
    vi.spyOn(store, 'saveOrderItem').mockImplementation(() => {
      throw err;
    });

    const { result } = renderHook(() => useOrders());

    let caught: unknown;
    try {
      result.current.createOrder(baseOrderData, [baseItem]);
    } catch (e) {
      caught = e;
    }

    expect(caught).toBe(err);
  });
});
