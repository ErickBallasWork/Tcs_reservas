import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AccessRequest } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { accessRequestLabels as labels } from '@/lib/labels';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove: (request: AccessRequest) => void;
  onReject: (request: AccessRequest) => void;
}

export function AccessRequestCard({ request, onApprove, onReject }: AccessRequestCardProps) {
  const isPending = request.status === 'PENDING';
  return (
    <li className="panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{request.fullName}</p>
          <p className="truncate text-sm text-ink-soft">{request.email}</p>
        </div>
        <Tag variant={request.kind === 'NEW_USER' ? 'gold' : 'default'}>
          {labels.kind[request.kind]}
        </Tag>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {request.department && (
          <div>
            <dt className="inline font-semibold">{labels.department}: </dt>
            <dd className="inline">{request.department}</dd>
          </div>
        )}
        {request.deviceLabel && (
          <div>
            <dt className="inline font-semibold">{labels.device}: </dt>
            <dd className="inline">{request.deviceLabel}</dd>
          </div>
        )}
        <div>
          <dt className="inline font-semibold">{labels.requestedAt}: </dt>
          <dd className="inline">
            {format(new Date(request.requestedAt), DATE_FORMAT, { locale: es })}
          </dd>
        </div>
        {request.decidedByName && (
          <div>
            <dd>{labels.decidedBy(request.decidedByName)}</dd>
          </div>
        )}
      </dl>
      {request.decisionComment && (
        <p className="rounded-lg bg-surface p-2 text-sm">{request.decisionComment}</p>
      )}
      {isPending && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-outline" onClick={() => onReject(request)}>
            {labels.reject}
          </button>
          <button type="button" className="btn btn-gold" onClick={() => onApprove(request)}>
            {labels.approve}
          </button>
        </div>
      )}
    </li>
  );
}
