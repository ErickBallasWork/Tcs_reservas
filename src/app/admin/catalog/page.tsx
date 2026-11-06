import { AppShell } from '@/components/layout/AppShell';
import { LaptopsAdminView } from '@/features/catalog/admin/LaptopsAdminView';

export default function AdminCatalogPage() {
  return (
    <AppShell title="Catálogo y laptops" mobileTitle="Catálogo">
      <LaptopsAdminView />
    </AppShell>
  );
}
