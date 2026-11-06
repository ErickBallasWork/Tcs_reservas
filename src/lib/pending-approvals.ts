import type { PendingApproval } from '@/api/types';

export interface SeriesGroup {
  kind: 'series';
  key: string;
  seriesId: string;
  seriesTotal: number;
  items: PendingApproval[];
}

export interface SingleEntry {
  kind: 'single';
  key: string;
  item: PendingApproval;
}

export type InboxEntry = SeriesGroup | SingleEntry;

export function groupPendingApprovals(items: readonly PendingApproval[]): InboxEntry[] {
  const seriesById = new Map<string, SeriesGroup>();
  const entries: InboxEntry[] = [];
  for (const item of items) {
    if (!item.series) {
      entries.push({ kind: 'single', key: item.id, item });
      continue;
    }
    const existing = seriesById.get(item.series.id);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    const group: SeriesGroup = {
      kind: 'series',
      key: item.series.id,
      seriesId: item.series.id,
      seriesTotal: item.series.occurrenceCount,
      items: [item],
    };
    seriesById.set(group.seriesId, group);
    entries.push(group);
  }
  return entries;
}
