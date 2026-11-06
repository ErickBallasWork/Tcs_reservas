import { Check, Filter, Lock, Star, type LucideIcon } from 'lucide-react';
import type { FloorState } from '@/lib/floor-plan/types';
import type { StateIcon } from '@/lib/floor-plan/zone-presentation';

export const STATE_ICONS: Record<StateIcon, LucideIcon | null> = {
  check: Check,
  lock: Lock,
  star: Star,
  filter: Filter,
  none: null,
};

export const STATE_SHAPE_TONE: Record<FloorState, string> = {
  FREE: 'fill-plan-zone stroke-plan-free',
  OCCUPIED: 'stroke-plan-occupied',
  MINE: 'fill-plan-mine stroke-plan-mine',
  OUT_OF_FILTER: 'fill-plan-zone stroke-plan-muted-ink',
  NOT_RESERVABLE: 'fill-plan-muted stroke-plan-grid',
};
