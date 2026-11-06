'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { errorMessages } from '@/api/error-messages';
import { Tag } from '@/components/shared/Tag';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { PendingRequestPanel } from '@/features/auth/PendingRequestPanel';
import { usePendingRequest } from '@/features/auth/usePendingRequest';
import { useAuth } from '@/lib/auth';
import { authLabels } from '@/lib/labels';
import { homeForRoles } from '@/lib/nav';

function Welcome() {
  const { endedReason } = useAuth();
  return (
    <section className="flex flex-col gap-3.5">
      <h1 className="text-[22px] font-bold text-brand">{authLabels.loginTitle}</h1>
      {endedReason && (
        <p role="alert" className="alert">
          <strong>{authLabels.sessionEnded}.</strong> {errorMessages[endedReason]}
        </p>
      )}
      <p>{authLabels.loginIntro}</p>
      <Link href="/request-access" className="btn btn-gold">
        {authLabels.requestAccess}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <small className="text-ink-soft">{authLabels.allowedDomainsHint}</small>
        <Tag>@tcs.com</Tag>
        <Tag>@pichincha.com</Tag>
      </div>
    </section>
  );
}

function Checking() {
  return (
    <p className="flex items-center gap-2" role="status">
      <span className="spinner" aria-hidden />
      {authLabels.checkingDevice}
    </p>
  );
}

function Unavailable() {
  const { retry } = useAuth();
  return (
    <section className="flex flex-col gap-3.5">
      <h1 className="text-[22px] font-bold text-brand">{authLabels.unavailableTitle}</h1>
      <p role="alert">{authLabels.unavailableText}</p>
      <button type="button" className="btn btn-gold" onClick={() => void retry()}>
        {authLabels.retry}
      </button>
    </section>
  );
}

export function LoginView() {
  const router = useRouter();
  const { status, roles } = useAuth();
  const pending = usePendingRequest();

  useEffect(() => {
    if (status === 'authenticated') router.replace(homeForRoles(roles));
  }, [status, roles, router]);

  return (
    <AuthLayout>
      {status === 'loading' && <Checking />}
      {status === 'unavailable' && <Unavailable />}
      {status === 'anonymous' &&
        (pending ? <PendingRequestPanel pending={pending} /> : <Welcome />)}
    </AuthLayout>
  );
}
