'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { SanctionStatus } from '@/api/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResolveSanctionDialog } from '@/features/sanctions/ResolveSanctionDialog';
import { SanctionGroupCard } from '@/features/sanctions/SanctionGroupCard';
import { SANCTIONS_PAGE_SIZE } from '@/features/sanctions/api';
import { useSanctions } from '@/features/sanctions/useSanctions';
import { sanctionsLabels as labels } from '@/lib/labels';
import { groupSanctionsByUser, type SanctionGroup } from '@/lib/sanction-groups';

const STATUSES: SanctionStatus[] = ['ACTIVE', 'RESOLVED'];

export function SanctionsView() {
  const [status, setStatus] = useState<SanctionStatus>('ACTIVE');
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<SanctionGroup | null>(null);
  const sanctions = useSanctions(status, page);

  const groups = useMemo(() => groupSanctionsByUser(sanctions.data?.items ?? []), [sanctions.data]);
  const totalPages = Math.max(1, Math.ceil((sanctions.data?.total ?? 0) / SANCTIONS_PAGE_SIZE));

  const handleStatusChange = (next: string) => {
    setStatus(next as SanctionStatus);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={status} onValueChange={handleStatusChange}>
        <TabsList className="h-auto w-full sm:w-fit">
          {STATUSES.map((value) => (
            <TabsTrigger key={value} value={value} className="min-h-11 flex-1 px-4 sm:flex-none">
              {labels.tabs[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {sanctions.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {sanctions.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(sanctions.error)}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void sanctions.refetch()}
          >
            {labels.retry}
          </button>
        </div>
      )}

      {sanctions.data && groups.length === 0 && (
        <p className="text-ink-soft">{labels.empty[status]}</p>
      )}

      {groups.length > 0 && (
        <ul className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {groups.map((group) => (
            <SanctionGroupCard key={group.user.id} group={group} onResolve={setResolving} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-2" aria-label={labels.title}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            {labels.previous}
          </button>
          <span className="text-sm text-ink-soft">{labels.page(page, totalPages)}</span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            {labels.next}
          </button>
        </nav>
      )}

      {resolving && <ResolveSanctionDialog group={resolving} onClose={() => setResolving(null)} />}
    </div>
  );
}
