'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Field } from '@/components/shared/Field';
import type { SuperadminCredentials } from '@/features/auth/api';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { signInAsSuperadmin } from '@/features/auth/session-store';
import {
  messageForTestLoginError,
  parseTestLoginForm,
  type TestLoginErrors,
  type TestLoginField,
} from '@/features/auth/test-login/test-login-form';
import { useAuth } from '@/lib/auth';
import { testLoginLabels } from '@/lib/labels';
import { homeForRoles } from '@/lib/nav';

const EMPTY_FORM: SuperadminCredentials = { email: '', password: '' };

export function TestLoginView() {
  const router = useRouter();
  const { status, roles } = useAuth();
  const [form, setForm] = useState<SuperadminCredentials>(EMPTY_FORM);
  const [errors, setErrors] = useState<TestLoginErrors>({});

  const signIn = useMutation({ mutationFn: signInAsSuperadmin });

  useEffect(() => {
    if (status === 'authenticated') router.replace(homeForRoles(roles));
  }, [status, roles, router]);

  const handleChange = (name: TestLoginField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseTestLoginForm(form);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    signIn.mutate(result.data);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <h1 className="text-[22px] font-bold text-brand">{testLoginLabels.title}</h1>
        <p>{testLoginLabels.intro}</p>
        <Field label={testLoginLabels.emailLabel} error={errors.email}>
          <input
            className="field"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            aria-invalid={errors.email ? true : undefined}
            onChange={(event) => handleChange('email', event.target.value)}
          />
        </Field>
        <Field label={testLoginLabels.passwordLabel} error={errors.password}>
          <input
            className="field"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            aria-invalid={errors.password ? true : undefined}
            onChange={(event) => handleChange('password', event.target.value)}
          />
        </Field>
        {signIn.isError && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForTestLoginError(signIn.error)}
          </p>
        )}
        <button type="submit" className="btn btn-gold" disabled={signIn.isPending}>
          {signIn.isPending && <span className="spinner" aria-hidden />}
          {signIn.isPending ? testLoginLabels.signingIn : testLoginLabels.submit}
        </button>
      </form>
    </AuthLayout>
  );
}
