import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MyReservationsList } from "@/features/reservations/MyReservationList";

export default function MyReservationsPage() {
  return (
    <AppShell title="Mis reservas">
      <Suspense fallback={null}>
        <MyReservationsList />
      </Suspense>
    </AppShell>
  );
}