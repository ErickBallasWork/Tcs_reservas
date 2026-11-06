'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { homeForRoles } from '@/lib/nav';

export default function Home() {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(homeForRoles([role]));
  }, [role, router]);

  return null;
}
