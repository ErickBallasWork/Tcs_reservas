import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FloorPlansAdminView } from '@/features/floor-plans/admin/FloorPlansAdminView';

export default function AdminFloorPlansPage() {
  return (
    <AppShell title="Planos de los edificios" mobileTitle="Planos">
      <Suspense fallback={null}>
        <FloorPlansAdminView />
      </Suspense>
    </AppShell>
  );
}
