import { authLabels } from '@/lib/labels';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="bg-brand p-5 text-white md:flex md:flex-1 md:flex-col md:justify-center md:gap-2.5 md:p-20">
        <div className="text-lg font-bold md:text-[46px] md:font-extrabold">
          TCS <span className="md:text-gold">Reservas</span>
        </div>
        <p className="hidden md:block">{authLabels.brandTagline}</p>
      </div>
      <main className="flex flex-1 flex-col justify-center gap-3.5 bg-surface p-4 md:bg-white md:px-[120px]">
        {children}
      </main>
    </div>
  );
}
