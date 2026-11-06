import { parsePublicConfig, type PublicConfig } from '@/lib/public-config';

export const publicConfig: PublicConfig = parsePublicConfig({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  enableTestLogin: process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN,
});
