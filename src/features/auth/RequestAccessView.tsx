'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { postAccessRequest } from '@/features/auth/api';
import {
  type AccessRequestErrors,
  type AccessRequestField,
  type AccessRequestForm,
  parseAccessRequestForm,
} from '@/features/auth/access-request-schema';
import { AuthLayout } from '@/features/auth/AuthLayout';
import {
  describeDevice,
  generateDeviceSecret,
  writePendingRequest,
} from '@/features/auth/device-credentials';
import { usePendingRequest } from '@/features/auth/usePendingRequest';
import { useAuth } from '@/lib/auth';
import { authLabels } from '@/lib/labels';
import { homeForRoles } from '@/lib/nav';

const EMPTY_FORM: AccessRequestForm = { email: '', fullName: '', department: '' };

interface FieldProps {
  name: AccessRequestField;
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (name: AccessRequestField, value: string) => void;
}

function Field({ name, label, value, error, type = 'text', onChange, ...rest }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <label className="field-label">
      {label}
      <input
        className="field"
        name={name}
        type={type}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert" className="font-normal text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

export function RequestAccessView() {
  const router = useRouter();
  const { status, roles } = useAuth();
  const pending = usePendingRequest();
  const [form, setForm] = useState<AccessRequestForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<AccessRequestErrors>({});

  const send = useMutation({
    mutationFn: async (data: AccessRequestForm) => {
      const deviceSecret = generateDeviceSecret();
      const requestId = await postAccessRequest({
        email: data.email,
        fullName: data.fullName,
        department: data.department || undefined,
        deviceSecret,
        deviceLabel: describeDevice(navigator.userAgent),
      });
      writePendingRequest({ requestId, deviceSecret, email: data.email });
    },
    onSuccess: () => router.push('/login'),
  });

  useEffect(() => {
    if (status === 'authenticated') router.replace(homeForRoles(roles));
  }, [status, roles, router]);

  useEffect(() => {
    if (pending && !send.isPending) router.replace('/login');
  }, [pending, send.isPending, router]);

  const handleChange = (name: AccessRequestField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseAccessRequestForm(form);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    send.mutate(result.data);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <h1 className="text-[22px] font-bold text-brand">{authLabels.requestTitle}</h1>
        <p>{authLabels.requestIntro}</p>
        <Field
          name="email"
          type="email"
          label={authLabels.emailLabel}
          placeholder={authLabels.emailPlaceholder}
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={handleChange}
        />
        <Field
          name="fullName"
          label={authLabels.fullNameLabel}
          autoComplete="name"
          value={form.fullName}
          error={errors.fullName}
          onChange={handleChange}
        />
        <Field
          name="department"
          label={authLabels.departmentLabel}
          value={form.department}
          error={errors.department}
          onChange={handleChange}
        />
        {send.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(send.error)}
          </p>
        )}
        <button type="submit" className="btn btn-gold" disabled={send.isPending}>
          {send.isPending && <span className="spinner" aria-hidden />}
          {send.isPending ? authLabels.sending : authLabels.submitRequest}
        </button>
        <Link href="/login" className="btn btn-outline">
          {authLabels.backToLogin}
        </Link>
      </form>
    </AuthLayout>
  );
}
