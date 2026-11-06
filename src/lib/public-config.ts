import { z } from 'zod';

const publicConfigSchema = z.object({
  apiUrl: z.url({ protocol: /^https?$/ }).transform((url) => url.replace(/\/+$/, '')),
});

export type PublicConfig = z.infer<typeof publicConfigSchema>;

export interface RawPublicConfig {
  apiUrl: string | undefined;
}

export function parsePublicConfig(raw: RawPublicConfig): PublicConfig {
  const result = publicConfigSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid public configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
