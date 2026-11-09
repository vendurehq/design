import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleXIcon,
  LoaderIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from 'lucide-react';

/**
 * The icon of each tone. A StatusBadge and a toast read the same map, so a
 * tone has one shape everywhere: the shape says the state again, and a state
 * never depends on colour alone. `progress` is the loader the caller spins.
 */
export const toneIcons: Record<Tone, LucideIcon> = {
  neutral: CircleDashedIcon,
  info: CircleDotIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  critical: CircleXIcon,
  progress: LoaderIcon,
};
