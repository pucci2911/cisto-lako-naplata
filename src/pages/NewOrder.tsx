import { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/store/data';
import { Button } from '@/components/ui/button';
import ClaimTicket from '@/components/ClaimTicket';
import { toast } from 'sonner';
import { useCustomers } from '@/hooks/useCustomers';
import { usePriceList } from '@/hooks/usePriceList';
import { useOrders } from '@/hooks/useOrders';
import { newOrderReducer, createInitialState, type DraftItem } from './new-order/state';
import { CustomerStep } from './new-order/CustomerStep';
import { ItemsStep } from './new-order/ItemsStep';
import { DetailsStep } from './new-order/DetailsStep';
import { PaymentStep } from './new-order/PaymentStep';
import { StickyBottomBar } from './new-order/StickyBottomBar';

export default function NewOrder() {
  const navigate = useNavigate();
  const settings = useMemo(() => getSettings(), []);

  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + settings.defaultTurnaroundDays);
    return d.toISOString().split('T')[0];
  }, [settings.defaultTurnaroundDays]);

  const [state, dispatch] = useReducer(newOrderReducer, defaultDueDate, createInitialState);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { create: createCustomer, search: searchCustomers } = useCustomers();
  const { activeItems: activePriceList, findById: findPriceListItem } = usePriceList();
  const { createOrder } = useOrders();

  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + (i.unitPrice + i.upchargeAmount) * i.quantity, 0),
    [state.items]
  );
  const amountDue = totalPrice - state.amountPaid;

  // Warn before leaving when dirty
  useEffect(() => {
    if (!state.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.isDirty]);

  const matchingCustomers = useMemo(
    () => searchCustomers(state.custSearch),
    [searchCustomers, state.custSearch]
  );

  const handleAddFromPriceList = useCallback(
    (plId: string) => {
      const pl = findPriceListItem(plId);
      if (!pl) return;
      const item: DraftItem = {
        id: crypto.randomUUID(),
        itemName: pl.itemName,
        category: pl.category,
        quantity: 1,
        unitPrice: pl.basePrice,
        upchargeAmount: 0,
        note: '',
        stainNotes: '',
        damageNotes: '',
        specialInstructions: '',
        showNotes: false,
      };
      dispatch({ type: 'ADD_ITEM', item });
    },
    [findPriceListItem]
  );

  const handleAddManual = useCallback(() => {
    if (!state.manualName) return;
    const item: DraftItem = {
      id: crypto.randomUUID(),
      itemName: state.manualName,
      category: state.manualCategory,
      quantity: state.manualQty,
      unitPrice: state.manualPrice,
      upchargeAmount: 0,
      note: '',
      stainNotes: '',
      damageNotes: '',
      specialInstructions: '',
      showNotes: false,
    };
    dispatch({ type: 'ADD_ITEM', item });
    dispatch({ type: 'RESET_MANUAL_FORM' });
  }, [state.manualName, state.manualCategory, state.manualQty, state.manualPrice]);

  const handleCreateCustomer = useCallback(async () => {
    if (!state.newCustName || !state.newCustPhone) return;
    try {
      const c = await createCustomer({
        fullName: state.newCustName,
        phone: state.newCustPhone,
        email: state.newCustEmail || undefined,
        preferredNotificationChannel: state.newCustEmail ? 'email' : 'none',
      });
      dispatch({ type: 'SELECT_CUSTOMER', customer: c });
      dispatch({ type: 'RESET_NEW_CUST_FORM' });
    } catch {
      toast.error('Greška pri kreiranju kupca.');
    }
  }, [state.newCustName, state.newCustPhone, state.newCustEmail, createCustomer]);

  const handleSave = useCallback(async () => {
    if (!state.selectedCustomer || state.items.length === 0 || saving) return;
    setSaving(true);
    try {
      const order = await createOrder(
        {
          customerId: state.selectedCustomer.id,
          dueDate: state.dueDate,
          status: 'Primljeno',
          paymentStatus: state.paymentStatus,
          paymentMethod: state.paymentMethod,
          totalPrice,
          amountPaid: state.amountPaid,
          rackLocation: state.rackLocation || undefined,
          internalNotes: state.internalNotes || undefined,
          customerNote: state.customerNote || undefined,
        },
        state.items.map(item => ({
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          upchargeAmount: item.upchargeAmount || undefined,
          note: item.note || undefined,
          stainNotes: item.stainNotes || undefined,
          damageNotes: item.damageNotes || undefined,
          specialInstructions: item.specialInstructions || undefined,
          itemStatus: 'Na cekanju',
        }))
      );
      dispatch({ type: 'CLEAR_DIRTY' });
      toast.success('Porudžbina uspešno kreirana.');
      setSavedOrderId(order.id);
    } catch {
      toast.error('Greška pri kreiranju porudžbine. Pokušajte ponovo.');
    } finally {
      setSaving(false);
    }
  }, [state, totalPrice, saving, createOrder]);

  if (savedOrderId) {
    return (
      <div>
        <div className="mb-4 no-print flex gap-2">
          <Button variant="outline" onClick={() => navigate('/porudzbine')}>← Lista porudžbina</Button>
          <Button variant="outline" onClick={() => navigate('/kontrolna-tabla')}>Kontrolna tabla</Button>
        </div>
        <ClaimTicket orderId={savedOrderId} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-title mb-6">Nova porudžbina</h1>

      <CustomerStep
        state={state}
        dispatch={dispatch}
        matchingCustomers={matchingCustomers}
        onCreateCustomer={handleCreateCustomer}
      />

      <ItemsStep
        state={state}
        dispatch={dispatch}
        activePriceList={activePriceList}
        totalPrice={totalPrice}
        onAddFromPriceList={handleAddFromPriceList}
        onAddManual={handleAddManual}
      />

      <DetailsStep state={state} dispatch={dispatch} />

      <PaymentStep state={state} dispatch={dispatch} amountDue={amountDue} />

      <StickyBottomBar
        totalPrice={totalPrice}
        selectedCustomer={state.selectedCustomer}
        itemsCount={state.items.length}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
