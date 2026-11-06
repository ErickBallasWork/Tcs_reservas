'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AccessRequest, AccessRequestStatus } from '@/api/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccessRequestCard } from '@/features/access-requests/AccessRequestCard';
import { ApproveDialog } from '@/features/access-requests/ApproveDialog';
import { RejectDialog } from '@/features/access-requests/RejectDialog';
import { ACCESS_REQUESTS_PAGE_SIZE } from '@/features/access-requests/api';
import { useAccessRequests } from '@/features/access-requests/useAccessRequests';
import { accessRequestLabels as labels } from '@/lib/labels';

const STATUSES: AccessRequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

type Action = { type: 'approve' | 'reject'; request: AccessRequest } | null;

export function AccessRequestsView() {
  const [status, setStatus] = useState<AccessRequestStatus>('PENDING');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action>(null);
  const requests = useAccessRequests(status, page);

  const totalPages = Math.max(
    1,
    Math.ceil((requests.data?.total ?? 0) / ACCESS_REQUESTS_PAGE_SIZE),
  );
  const closeAction = () => setAction(null);

  const handleStatusChange = (next: string) => {
    setStatus(next as AccessRequestStatus);
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

      {requests.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {requests.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(requests.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void requests.refetch()}>
            {labels.retry}
          </button>
        </div>
      )}

      {requests.data && requests.data.items.length === 0 && (
        <p className="text-ink-soft">{labels.empty[status]}</p>
      )}

      {requests.data && requests.data.items.length > 0 && (
        <ul className="grid gap-3 lg:grid-cols-2">
          {requests.data.items.map((request) => (
            <AccessRequestCard
              key={request.id}
              request={request}
              onApprove={(target) => setAction({ type: 'approve', request: target })}
              onReject={(target) => setAction({ type: 'reject', request: target })}
            />
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

      {action?.type === 'approve' && (
        <ApproveDialog request={action.request} onClose={closeAction} />
      )}
      {action?.type === 'reject' && <RejectDialog request={action.request} onClose={closeAction} />}
    </div>
  );
}
