import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/format';
import type { PaymentMethod, PaymentStatus } from '@/types';
import type { NewOrderAction, NewOrderState } from './state';

interface Props {
  state: NewOrderState;
  dispatch: React.Dispatch<NewOrderAction>;
  amountDue: number;
}

export function PaymentStep({ state, dispatch, amountDue }: Props) {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
      <h2 className="text-lg font-semibold mb-4">4. Plaćanje</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Način plaćanja</Label>
          <Select value={state.paymentMethod} onValueChange={v => dispatch({ type: 'SET_PAYMENT_METHOD', value: v as PaymentMethod })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Kes">Keš</SelectItem>
              <SelectItem value="Kartica">Kartica</SelectItem>
              <SelectItem value="Kombinovano">Kombinovano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Status plaćanja</Label>
          <Select value={state.paymentStatus} onValueChange={v => dispatch({ type: 'SET_PAYMENT_STATUS', value: v as PaymentStatus })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nije placeno">Nije plaćeno</SelectItem>
              <SelectItem value="Delimicno placeno">Delimično plaćeno</SelectItem>
              <SelectItem value="Placeno">Plaćeno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Iznos plaćen (RSD)</Label>
          <Input
            type="number"
            min={0}
            value={state.amountPaid}
            onChange={e => dispatch({ type: 'SET_AMOUNT_PAID', value: Number(e.target.value) })}
            className="h-11"
          />
        </div>
        <div>
          <Label className="text-sm">Iznos za naplatu</Label>
          <p className="h-11 flex items-center text-lg font-bold">{formatPrice(amountDue)}</p>
        </div>
      </div>
    </section>
  );
}
