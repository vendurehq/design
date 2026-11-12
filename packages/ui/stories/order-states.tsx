import { CircleSlashIcon, TruckIcon } from 'lucide-react';
import { defineStateEntries } from '../src/lib/state-dictionary.ts';

// The order states of the stories, declared the way an app declares its own
// domain map. Every order has a state, and none is a normal state that could
// show nothing, so a column shows the tone icon and a neutral label. Colour
// goes only where the state asks for the reader: the orders to fulfil (info),
// the finished ones (success), the ones that wait on someone (warning) and the
// ones that went wrong (critical). The other states stay grey. Each group has
// its own shape, so the column reads without colour too. No state spins: a
// spinner is for work that runs right now and ends in seconds or minutes, and
// an order stays Shipped for days.

export type OrderState =
  | 'Draft'
  | 'AddingItems'
  | 'ArrangingPayment'
  | 'PaymentAuthorized'
  | 'PaymentSettled'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'PartiallyDelivered'
  | 'Delivered'
  | 'Modifying'
  | 'ArrangingAdditionalPayment'
  | 'Cancelled'
  | 'PaymentDeclined';

export const orderStates = defineStateEntries<OrderState>({
  Draft: { tone: 'neutral', defaultLabel: 'Draft' },
  AddingItems: { tone: 'neutral', defaultLabel: 'Adding items' },
  ArrangingPayment: { tone: 'neutral', defaultLabel: 'Arranging payment' },
  PaymentAuthorized: { tone: 'info', defaultLabel: 'Payment authorized' },
  PaymentSettled: { tone: 'info', defaultLabel: 'Payment settled' },
  PartiallyShipped: { tone: 'neutral', defaultLabel: 'Partially shipped', icon: <TruckIcon /> },
  Shipped: { tone: 'neutral', defaultLabel: 'Shipped', icon: <TruckIcon /> },
  // Part of the order is still on its way, so it keeps the truck: a green
  // check would count it as finished.
  PartiallyDelivered: { tone: 'neutral', defaultLabel: 'Partially delivered', icon: <TruckIcon /> },
  Delivered: { tone: 'success', defaultLabel: 'Delivered' },
  Modifying: { tone: 'warning', defaultLabel: 'Modifying' },
  ArrangingAdditionalPayment: { tone: 'warning', defaultLabel: 'Arranging additional payment' },
  Cancelled: { tone: 'neutral', defaultLabel: 'Cancelled', icon: <CircleSlashIcon /> },
  // Not a state of Vendure's default order process: a plugin can add one.
  PaymentDeclined: { tone: 'critical', defaultLabel: 'Payment declined' },
});
