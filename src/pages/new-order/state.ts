import type { Customer, PaymentMethod, PaymentStatus } from '@/types';

export interface DraftItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  upchargeAmount: number;
  note: string;
  stainNotes: string;
  damageNotes: string;
  specialInstructions: string;
  showNotes: boolean;
}

export interface NewOrderState {
  // Customer
  custSearch: string;
  selectedCustomer: Customer | null;
  showNewCustForm: boolean;
  newCustName: string;
  newCustPhone: string;
  newCustEmail: string;
  // Items
  items: DraftItem[];
  showManualForm: boolean;
  manualName: string;
  manualCategory: string;
  manualQty: number;
  manualPrice: number;
  // Details
  dueDate: string;
  rackLocation: string;
  customerNote: string;
  internalNotes: string;
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  // Meta
  isDirty: boolean;
}

export type NewOrderAction =
  | { type: 'SET_CUST_SEARCH'; value: string }
  | { type: 'SELECT_CUSTOMER'; customer: Customer | null }
  | { type: 'SHOW_NEW_CUST_FORM'; value: boolean }
  | { type: 'SET_NEW_CUST_FIELD'; field: 'newCustName' | 'newCustPhone' | 'newCustEmail'; value: string }
  | { type: 'RESET_NEW_CUST_FORM' }
  | { type: 'ADD_ITEM'; item: DraftItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_ITEM'; id: string; field: keyof DraftItem; value: unknown }
  | { type: 'SHOW_MANUAL_FORM'; value: boolean }
  | { type: 'SET_MANUAL_FIELD'; field: 'manualName' | 'manualCategory' | 'manualQty' | 'manualPrice'; value: string | number }
  | { type: 'RESET_MANUAL_FORM' }
  | { type: 'SET_DETAIL'; field: 'dueDate' | 'rackLocation' | 'customerNote' | 'internalNotes'; value: string }
  | { type: 'SET_PAYMENT_METHOD'; value: PaymentMethod }
  | { type: 'SET_PAYMENT_STATUS'; value: PaymentStatus }
  | { type: 'SET_AMOUNT_PAID'; value: number }
  | { type: 'MARK_DIRTY' }
  | { type: 'CLEAR_DIRTY' };

export function createInitialState(defaultDueDate: string): NewOrderState {
  return {
    custSearch: '',
    selectedCustomer: null,
    showNewCustForm: false,
    newCustName: '',
    newCustPhone: '',
    newCustEmail: '',
    items: [],
    showManualForm: false,
    manualName: '',
    manualCategory: '',
    manualQty: 1,
    manualPrice: 0,
    dueDate: defaultDueDate,
    rackLocation: '',
    customerNote: '',
    internalNotes: '',
    paymentMethod: 'Kes',
    paymentStatus: 'Nije placeno',
    amountPaid: 0,
    isDirty: false,
  };
}

export function newOrderReducer(state: NewOrderState, action: NewOrderAction): NewOrderState {
  switch (action.type) {
    case 'SET_CUST_SEARCH':
      return { ...state, custSearch: action.value, showNewCustForm: false };
    case 'SELECT_CUSTOMER':
      return { ...state, selectedCustomer: action.customer, custSearch: '', isDirty: action.customer ? true : state.isDirty };
    case 'SHOW_NEW_CUST_FORM': {
      if (!action.value) return { ...state, showNewCustForm: false };
      const search = state.custSearch.trim();
      const isPhone = /^[+\d\s()-]+$/.test(search) && /\d/.test(search);
      return {
        ...state,
        showNewCustForm: true,
        newCustName: isPhone ? state.newCustName : (state.newCustName || search),
        newCustPhone: isPhone ? (state.newCustPhone || search) : state.newCustPhone,
      };
    }
    case 'SET_NEW_CUST_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_NEW_CUST_FORM':
      return { ...state, newCustName: '', newCustPhone: '', newCustEmail: '', showNewCustForm: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item], isDirty: true };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id), isDirty: true };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i => (i.id === action.id ? { ...i, [action.field]: action.value } : i)),
        isDirty: true,
      };
    case 'SHOW_MANUAL_FORM':
      return { ...state, showManualForm: action.value };
    case 'SET_MANUAL_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_MANUAL_FORM':
      return { ...state, manualName: '', manualCategory: '', manualQty: 1, manualPrice: 0, showManualForm: false };
    case 'SET_DETAIL':
      return { ...state, [action.field]: action.value, isDirty: true };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.value, isDirty: true };
    case 'SET_PAYMENT_STATUS':
      return { ...state, paymentStatus: action.value, isDirty: true };
    case 'SET_AMOUNT_PAID':
      return { ...state, amountPaid: action.value, isDirty: true };
    case 'MARK_DIRTY':
      return { ...state, isDirty: true };
    case 'CLEAR_DIRTY':
      return { ...state, isDirty: false };
    default:
      return state;
  }
}
