import { cn } from '@/lib/utils';
import type { SlotStatus } from '@/types';

const styles: Record<SlotStatus, string> = {
  free: 'bg-soft text-brand',
  occupied: 'bg-brand text-white',
  blocked: 'bg-gold-soft text-gold-ink',
};

const labels: Record<SlotStatus, string> = {
  free: 'Libre',
  occupied: 'Ocupado',
  blocked: 'Bloqueado',
};

export function SlotCell({ status }: { status: SlotStatus }) {
  return (
    <b
      className={cn(
        'block rounded-md px-1 py-2.5 text-center text-xs font-semibold',
        styles[status],
      )}
    >
      {labels[status]}
    </b>
  );
}
