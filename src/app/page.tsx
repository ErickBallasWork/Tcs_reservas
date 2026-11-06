'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { homeByRole } from '@/lib/nav';

export default function Home() {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(homeByRole[role]);
  }, [role, router]);

  return null;
}
