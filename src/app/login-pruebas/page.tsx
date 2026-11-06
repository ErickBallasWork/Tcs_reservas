import { notFound } from 'next/navigation';
import { TestLoginView } from '@/features/auth/test-login/TestLoginView';
import { publicConfig } from '@/lib/config';

export default function TestLoginPage() {
  if (!publicConfig.enableTestLogin) notFound();
  return <TestLoginView />;
}
