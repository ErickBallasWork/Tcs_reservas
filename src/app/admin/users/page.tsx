import { AppShell } from '@/components/layout/AppShell';
import { UsersView } from '@/features/users/UsersView';

export default function UsersPage() {
  return (
    <AppShell title="Usuarios y roles" mobileTitle="Usuarios">
      <UsersView />
    </AppShell>
  );
}
