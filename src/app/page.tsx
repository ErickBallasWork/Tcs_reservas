'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { homeForRoles } from '@/lib/nav';

export default function Home() {
  const { status, roles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace(homeForRoles(roles));
    else if (status === 'anonymous' || status === 'unavailable') router.replace('/login');
  }, [status, roles, router]);

  return null;
}
