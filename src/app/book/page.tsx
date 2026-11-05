import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BookingForm } from "@/features/booking/BookingForm";

export default function BookPage() {
  return (
    <AppShell title="Nueva reserva">
      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>
    </AppShell>
  );
}
