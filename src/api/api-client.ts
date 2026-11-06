import { createApiClient } from '@/api/client';
import { publicConfig } from '@/lib/config';

export const apiClient = createApiClient({
  baseUrl: publicConfig.apiUrl,
  getToken: () => null,
});
