import { createApiClient } from '@/api/client';
import { getAccessToken, notifyUnauthorized } from '@/lib/access-token';
import { publicConfig } from '@/lib/config';

export const apiClient = createApiClient({
  baseUrl: publicConfig.apiUrl,
  getToken: getAccessToken,
  onUnauthorized: notifyUnauthorized,
});
