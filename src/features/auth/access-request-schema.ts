import { z } from 'zod';
import { authLabels } from '@/lib/labels';

export const ALLOWED_EMAIL_DOMAINS = ['tcs.com', 'pichincha.com'] as const;

const MAX_NAME_LENGTH = 200;
const MAX_DEPARTMENT_LENGTH = 120;

export interface AccessRequestForm {
  email: string;
  fullName: string;
  department: string;
}

export type AccessRequestField = keyof AccessRequestForm;
export type AccessRequestErrors = Partial<Record<AccessRequestField, string>>;

function hasAllowedDomain(email: string): boolean {
  const domain = email.slice(email.lastIndexOf('@') + 1);
  return ALLOWED_EMAIL_DOMAINS.some((allowed) => allowed === domain);
}

const accessRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: authLabels.emailInvalid }))
    .refine(hasAllowedDomain, { error: authLabels.emailDomain }),
  fullName: z
    .string()
    .trim()
    .min(1, { error: authLabels.fullNameRequired })
    .max(MAX_NAME_LENGTH, { error: authLabels.fullNameTooLong }),
  department: z.string().trim().max(MAX_DEPARTMENT_LENGTH, { error: authLabels.departmentTooLong }),
});

export type AccessRequestParse =
  { success: true; data: AccessRequestForm } | { success: false; errors: AccessRequestErrors };

export function parseAccessRequestForm(input: AccessRequestForm): AccessRequestParse {
  const result = accessRequestSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const errors: AccessRequestErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && field in input && !errors[field as AccessRequestField]) {
      errors[field as AccessRequestField] = issue.message;
    }
  }
  return { success: false, errors };
}
