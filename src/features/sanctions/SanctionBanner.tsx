'use client';

import { useActiveSanction } from '@/features/sanctions/useActiveSanction';
import { toLocal } from '@/lib/booking-time';
import { sanctionBannerLabels as labels } from '@/lib/labels';

export function SanctionBanner() {
  const { data: sanction } = useActiveSanction();
  if (!sanction) return null;

  return (
    <div role="alert" className="alert flex flex-col gap-1">
      <b>{labels.title}</b>
      <span>{labels.text}</span>
      <small>{labels.detail(sanction.reason, toLocal(sanction.startDate).date)}</small>
    </div>
  );
}
