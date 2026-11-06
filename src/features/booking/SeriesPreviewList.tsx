import type { SeriesOccurrencePreview } from '@/api/types';
import { messageForCode } from '@/api/error-messages';
import { Tag } from '@/components/shared/Tag';
import { formatRange } from '@/lib/booking-time';
import { bookingLabels as labels } from '@/lib/labels';

interface SeriesPreviewListProps {
  occurrences: readonly SeriesOccurrencePreview[];
}

export function SeriesPreviewList({ occurrences }: SeriesPreviewListProps) {
  const available = occurrences.filter((occurrence) => occurrence.available).length;

  return (
    <section className="flex flex-col gap-2" aria-label={labels.previewTitle}>
      <h3 className="text-sm font-bold text-brand">{labels.previewTitle}</h3>
      <ul className="flex flex-col gap-1.5">
        {occurrences.map((occurrence) => (
          <li
            key={occurrence.index}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line p-2.5 text-sm"
          >
            <span>
              {occurrence.index}. {formatRange(occurrence.startDateTime, occurrence.endDateTime)}
            </span>
            {occurrence.available ? (
              <Tag>{labels.previewAvailable}</Tag>
            ) : (
              <Tag variant="gold">{messageForCode(occurrence.reason ?? 'UNKNOWN_ERROR')}</Tag>
            )}
          </li>
        ))}
      </ul>
      <small className="text-ink-soft">
        {labels.previewSummary(available, occurrences.length)}
      </small>
    </section>
  );
}
