import { z } from 'zod';
import { ApiError } from '@/api/api-error';
import { messageForError } from '@/api/error-messages';
import type { SuperadminCredentials } from '@/features/auth/api';
import { testLoginLabels } from '@/lib/labels';

const TOO_MANY_REQUESTS_STATUS = 429;

export type TestLoginField = keyof SuperadminCredentials;
export type TestLoginErrors = Partial<Record<TestLoginField, string>>;

const testLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, { error: testLoginLabels.emailRequired }),
  password: z.string().min(1, { error: testLoginLabels.passwordRequired }),
});

export type TestLoginParse =
  { success: true; data: SuperadminCredentials } | { success: false; errors: TestLoginErrors };

export function parseTestLoginForm(input: SuperadminCredentials): TestLoginParse {
  const result = testLoginSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const errors: TestLoginErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as TestLoginField;
    errors[field] ??= issue.message;
  }
  return { success: false, errors };
}

export function messageForTestLoginError(error: unknown): string {
  if (!(error instanceof ApiError)) return messageForError(error);
  if (error.status === TOO_MANY_REQUESTS_STATUS) return testLoginLabels.tooManyAttempts;
  if (error.code === 'INVALID_CREDENTIALS') return testLoginLabels.invalidCredentials;
  if (error.code === 'NOT_FOUND') return testLoginLabels.disabled;
  return error.details.find(Boolean) ?? messageForError(error);
}
