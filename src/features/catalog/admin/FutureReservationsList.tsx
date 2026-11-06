import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FutureReservation } from '@/api/types';
import { catalogAdminLabels as labels, catalogResourceTypeLabels } from '@/lib/labels';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

function formatDate(value: string): string {
  return format(new Date(value), DATE_FORMAT, { locale: es });
}

interface FutureReservationsListProps {
  reservations: FutureReservation[];
}

export function FutureReservationsList({ reservations }: FutureReservationsListProps) {
  const reservationLabels = labels.futureReservation;
  return (
    <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto">
      {reservations.map((reservation) => (
        <li key={reservation.id} className="rounded-lg border border-line p-3 text-sm">
          <p className="font-semibold">
            {reservation.resource.name} · {catalogResourceTypeLabels[reservation.resource.type]}
          </p>
          <p>
            {formatDate(reservation.startDateTime)} – {formatDate(reservation.endDateTime)}
          </p>
          <p className="text-ink-soft">
            {reservationLabels.by(reservation.user.fullName)} ·{' '}
            {reservationLabels.purpose[reservation.purpose] ?? reservation.purpose} ·{' '}
            {reservationLabels.status[reservation.status] ?? reservation.status}
          </p>
        </li>
      ))}
    </ul>
  );
}
