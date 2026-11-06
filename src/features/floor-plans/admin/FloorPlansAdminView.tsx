'use client';

import { useSearchParams } from 'next/navigation';
import { FloorPlanEditorScreen } from '@/features/floor-plans/admin/FloorPlanEditorScreen';
import { FloorPlansList } from '@/features/floor-plans/admin/FloorPlansList';

export function FloorPlansAdminView() {
  const id = useSearchParams().get('id');
  return id ? <FloorPlanEditorScreen key={id} id={id} /> : <FloorPlansList />;
}
