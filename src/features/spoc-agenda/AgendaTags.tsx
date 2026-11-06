import type { AgendaReservation } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { reservationStatusLabels, spocAgendaLabels as labels } from '@/lib/labels';

interface AgendaTagsProps {
  reservation: Pick<AgendaReservation, 'status' | 'reallocated' | 'seriesId'>;
}

export function AgendaTags({ reservation }: AgendaTagsProps) {
  const statusVariant = reservation.status === 'PENDING_APPROVAL' ? 'gold' : 'default';
  return (
    <div className="flex flex-wrap gap-1.5">
      <Tag variant={statusVariant}>{reservationStatusLabels[reservation.status]}</Tag>
      {reservation.reallocated && <Tag variant="dark">{labels.reallocated}</Tag>}
      {reservation.seriesId && <Tag>{labels.series}</Tag>}
    </div>
  );
}
