import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { Customer } from '@/types';
import type { NewOrderAction, NewOrderState } from './state';

interface Props {
  state: NewOrderState;
  dispatch: React.Dispatch<NewOrderAction>;
  matchingCustomers: Customer[];
  onCreateCustomer: () => void;
}

export function CustomerStep({ state, dispatch, matchingCustomers, onCreateCustomer }: Props) {
  const { selectedCustomer, custSearch, showNewCustForm, newCustName, newCustPhone, newCustEmail } = state;

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
      <h2 className="text-lg font-semibold mb-4">1. Kupac</h2>
      {selectedCustomer ? (
        <div className="flex items-center justify-between bg-muted rounded-lg p-4">
          <div>
            <p className="font-semibold text-base">{selectedCustomer.fullName}</p>
            <p className="text-muted-foreground">{selectedCustomer.phone}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SELECT_CUSTOMER', customer: null })}>Promeni</Button>
        </div>
      ) : (
        <div>
          <Input
            placeholder="Pretražite kupca po broju telefona ili imenu"
            value={custSearch}
            onChange={e => dispatch({ type: 'SET_CUST_SEARCH', value: e.target.value })}
            className="h-12 text-base mb-2"
          />
          {matchingCustomers.length > 0 && (
            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {matchingCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => dispatch({ type: 'SELECT_CUSTOMER', customer: c })}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{c.fullName}</span>
                  <span className="text-muted-foreground ml-3">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
          {custSearch.length >= 2 && matchingCustomers.length === 0 && !showNewCustForm && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Kupac nije pronađen.</p>
              <Button variant="outline" onClick={() => dispatch({ type: 'SHOW_NEW_CUST_FORM', value: true })}>
                <Plus size={16} className="mr-1" /> Dodaj novog kupca
              </Button>
            </div>
          )}
          {showNewCustForm && (
            <div className="border rounded-lg p-4 mt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Ime i prezime *</Label>
                  <Input value={newCustName} onChange={e => dispatch({ type: 'SET_NEW_CUST_FIELD', field: 'newCustName', value: e.target.value })} className="h-11" />
                </div>
                <div>
                  <Label className="text-sm">Telefon *</Label>
                  <Input value={newCustPhone} onChange={e => dispatch({ type: 'SET_NEW_CUST_FIELD', field: 'newCustPhone', value: e.target.value })} className="h-11" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Email (opciono)</Label>
                <Input value={newCustEmail} onChange={e => dispatch({ type: 'SET_NEW_CUST_FIELD', field: 'newCustEmail', value: e.target.value })} className="h-11" />
              </div>
              <Button onClick={onCreateCustomer} disabled={!newCustName || !newCustPhone}>Sačuvaj kupca</Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
