'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ApiError } from '@/api/api-error';
import { messageForError } from '@/api/error-messages';
import { fetchAccessRequestStatus } from '@/features/auth/api';
import { clearPendingRequest, type PendingRequest } from '@/features/auth/device-credentials';
import { enrollDevice } from '@/features/auth/session-store';
import { authLabels } from '@/lib/labels';

const POLL_INTERVAL_MS = 5000;

export function PendingRequestPanel({ pending }: { pending: PendingRequest }) {
  const status = useQuery({
    queryKey: ['access-request-status', pending.requestId],
    queryFn: () =>
      fetchAccessRequestStatus({
        requestId: pending.requestId,
        deviceSecret: pending.deviceSecret,
      }),
    refetchInterval: (query) =>
      query.state.data && query.state.data.status !== 'PENDING' ? false : POLL_INTERVAL_MS,
    retry: false,
  });
  const enroll = useMutation({ mutationFn: () => enrollDevice(pending) });
  const started = useRef(false);

  const decision = status.data?.status;
  const requestIsUnknown =
    status.error instanceof ApiError && status.error.code === 'ACCESS_REQUEST_NOT_FOUND';

  useEffect(() => {
    if (requestIsUnknown) clearPendingRequest();
  }, [requestIsUnknown]);

  useEffect(() => {
    if (decision !== 'APPROVED' || started.current) return;
    started.current = true;
    enroll.mutate();
  }, [decision, enroll]);

  if (decision === 'REJECTED') {
    return (
      <section className="flex flex-col gap-3.5" aria-live="polite">
        <XCircle className="size-10 text-red-700" aria-hidden />
        <h1 className="text-[22px] font-bold text-brand">{authLabels.rejectedTitle}</h1>
        <p>
          <strong>{authLabels.rejectedReason}</strong>{' '}
          {status.data?.decisionComment || authLabels.rejectedNoReason}
        </p>
        <button type="button" className="btn btn-gold" onClick={clearPendingRequest}>
          {authLabels.startOver}
        </button>
      </section>
    );
  }

  if (decision === 'APPROVED') {
    return (
      <section className="flex flex-col gap-3.5" aria-live="polite">
        <CheckCircle2 className="size-10 text-brand" aria-hidden />
        <h1 className="text-[22px] font-bold text-brand">{authLabels.approvedTitle}</h1>
        {enroll.isError ? (
          <>
            <p role="alert" className="font-semibold text-red-700">
              {messageForError(enroll.error)}
            </p>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => {
                started.current = true;
                enroll.mutate();
              }}
            >
              {authLabels.retry}
            </button>
          </>
        ) : (
          <p className="flex items-center gap-2">
            <span className="spinner" aria-hidden />
            {authLabels.approvedText}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3.5" aria-live="polite">
      <Clock className="size-10 text-brand" aria-hidden />
      <h1 className="text-[22px] font-bold text-brand">{authLabels.pendingTitle}</h1>
      <p>{authLabels.pendingText(pending.email)}</p>
      {status.isError && !requestIsUnknown && (
        <p role="alert" className="text-sm text-ink-soft">
          {messageForError(status.error)}
        </p>
      )}
      <button type="button" className="btn btn-outline" onClick={clearPendingRequest}>
        {authLabels.cancelRequest}
      </button>
    </section>
  );
}
