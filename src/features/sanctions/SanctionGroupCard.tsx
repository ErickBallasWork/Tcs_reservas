'use client';

import { Tag } from '@/components/shared/Tag';
import { formatRange, toLocal } from '@/lib/booking-time';
import { sanctionsLabels as labels } from '@/lib/labels';
import { activeSanctionIds, type SanctionGroup } from '@/lib/sanction-groups';

interface SanctionGroupCardProps {
  group: SanctionGroup;
  onResolve: (group: SanctionGroup) => void;
}

export function SanctionGroupCard({ group, onResolve }: SanctionGroupCardProps) {
  const activeCount = activeSanctionIds(group).length;

  return (
    <li className="panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <b className="truncate text-brand">{group.user.fullName}</b>
          <small className="truncate text-ink-soft">{group.user.email}</small>
        </div>
        <Tag variant={activeCount > 0 ? 'gold' : 'dark'}>
          {activeCount > 0 ? labels.activeCount(activeCount) : labels.statusResolved}
        </Tag>
      </div>

      <ul className="flex flex-col gap-2">
        {group.sanctions.map((sanction) => (
          <li key={sanction.id} className="flex flex-col gap-0.5 border-t border-soft pt-2 text-sm">
            <span className="font-medium">{sanction.reservation.resourceName}</span>
            <span className="text-ink-soft">
              {formatRange(sanction.reservation.startDateTime, sanction.reservation.endDateTime)}
            </span>
            <span className="text-ink-soft">{sanction.reason}</span>
            {sanction.status === 'RESOLVED' && (
              <small className="flex flex-col text-ink-soft">
                <span>
                  {labels.resolvedBy(
                    sanction.resolvedBy?.fullName ?? labels.unknownAdmin,
                    sanction.resolvedAt ? toLocal(sanction.resolvedAt).date : '',
                  )}
                </span>
                {sanction.resolutionComment && (
                  <span>{labels.resolutionComment(sanction.resolutionComment)}</span>
                )}
              </small>
            )}
          </li>
        ))}
      </ul>

      {activeCount > 0 && (
        <button type="button" className="btn btn-gold min-h-11" onClick={() => onResolve(group)}>
          {labels.resolve(activeCount)}
        </button>
      )}
    </li>
  );
}
