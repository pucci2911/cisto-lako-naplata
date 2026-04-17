import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { NewOrderAction, NewOrderState } from './state';

interface Props {
  state: NewOrderState;
  dispatch: React.Dispatch<NewOrderAction>;
}

export function DetailsStep({ state, dispatch }: Props) {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
      <h2 className="text-lg font-semibold mb-4">3. Detalji</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Datum preuzimanja</Label>
          <Input
            type="date"
            value={state.dueDate}
            onChange={e => dispatch({ type: 'SET_DETAIL', field: 'dueDate', value: e.target.value })}
            className="h-11"
          />
        </div>
        <div>
          <Label className="text-sm">Lokacija u prodavnici</Label>
          <Input
            value={state.rackLocation}
            onChange={e => dispatch({ type: 'SET_DETAIL', field: 'rackLocation', value: e.target.value })}
            placeholder="npr. A3"
            className="h-11"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-sm">Napomena za kupca</Label>
          <Textarea
            value={state.customerNote}
            onChange={e => dispatch({ type: 'SET_DETAIL', field: 'customerNote', value: e.target.value })}
            rows={2}
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-sm">Interna napomena</Label>
          <Textarea
            value={state.internalNotes}
            onChange={e => dispatch({ type: 'SET_DETAIL', field: 'internalNotes', value: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    </section>
  );
}
