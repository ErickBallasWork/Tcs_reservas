import { AppShell } from '@/components/layout/AppShell';
import { CatalogView } from '@/features/catalog/CatalogView';

export default function CatalogPage() {
  return (
    <AppShell title="Catálogo">
      <CatalogView />
    </AppShell>
  );
}
