import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Trash2, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { PriceListItem } from '@/types';
import type { NewOrderAction, NewOrderState } from './state';

interface Props {
  state: NewOrderState;
  dispatch: React.Dispatch<NewOrderAction>;
  activePriceList: PriceListItem[];
  totalPrice: number;
  onAddFromPriceList: (id: string) => void;
  onAddManual: () => void;
}

export function ItemsStep({ state, dispatch, activePriceList, totalPrice, onAddFromPriceList, onAddManual }: Props) {
  const { items, showManualForm, manualName, manualCategory, manualQty, manualPrice } = state;

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-6">
      <h2 className="text-lg font-semibold mb-4">2. Artikli</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-64 h-11 justify-between font-normal">
              Dodaj artikal iz cenovnika
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Pretraži po nazivu ili kategoriji..." />
              <CommandList>
                <CommandEmpty>Nema stavki za zadati pojam.</CommandEmpty>
                {activePriceList.map(p => (
                  <CommandItem key={p.id} value={`${p.itemName} ${p.category}`} onSelect={() => onAddFromPriceList(p.id)}>
                    {p.itemName} — {formatPrice(p.basePrice)}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={() => dispatch({ type: 'SHOW_MANUAL_FORM', value: !showManualForm })} className="h-11">
          Dodaj artikal ručno
        </Button>
      </div>

      {showManualForm && (
        <div className="border rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm">Naziv</Label>
              <Input value={manualName} onChange={e => dispatch({ type: 'SET_MANUAL_FIELD', field: 'manualName', value: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-sm">Kategorija</Label>
              <Input value={manualCategory} onChange={e => dispatch({ type: 'SET_MANUAL_FIELD', field: 'manualCategory', value: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label className="text-sm">Količina</Label>
              <Input type="number" min={1} value={manualQty} onChange={e => dispatch({ type: 'SET_MANUAL_FIELD', field: 'manualQty', value: Number(e.target.value) })} className="h-10" />
            </div>
            <div>
              <Label className="text-sm">Cena (RSD)</Label>
              <Input type="number" min={0} value={manualPrice} onChange={e => dispatch({ type: 'SET_MANUAL_FIELD', field: 'manualPrice', value: Number(e.target.value) })} className="h-10" />
            </div>
          </div>
          <Button size="sm" onClick={onAddManual} disabled={!manualName}>Dodaj</Button>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-medium">{item.itemName}</span>
                  <span className="text-muted-foreground text-sm ml-2">×{item.quantity}</span>
                  <span className="text-sm ml-2">{formatPrice(item.unitPrice)}</span>
                  {item.upchargeAmount > 0 && <span className="text-sm text-warning ml-1">+{formatPrice(item.upchargeAmount)}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.upchargeAmount}
                    onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'upchargeAmount', value: Number(e.target.value) })}
                    className="w-24 h-8 text-sm"
                    placeholder="Doplata"
                  />
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'showNotes', value: !item.showNotes })}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {item.showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                    className="p-1 text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  value={item.note}
                  onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'note', value: e.target.value })}
                  className="h-8 text-sm"
                  placeholder="Napomena (npr. fali dugme, fleka na rukavu...)"
                />
              </div>
              {item.showNotes && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Fleke</Label>
                    <Input value={item.stainNotes} onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'stainNotes', value: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Oštećenja</Label>
                    <Input value={item.damageNotes} onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'damageNotes', value: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Posebne instrukcije</Label>
                    <Input value={item.specialInstructions} onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'specialInstructions', value: e.target.value })} className="h-8 text-sm" />
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="text-right text-lg font-bold pt-2">Ukupno: {formatPrice(totalPrice)}</div>
        </div>
      )}
    </section>
  );
}
