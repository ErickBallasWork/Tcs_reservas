'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PermissionPrompt } from '@/features/notifications/PermissionPrompt';
import { SanctionBanner } from '@/features/sanctions/SanctionBanner';
import { useAuth } from '@/lib/auth';
import { authLabels, roleLabels } from '@/lib/labels';
import { canOpen, homeForRoles, navForRoles } from '@/lib/nav';
import { cn } from '@/lib/utils';

const MOBILE_SLOTS = 4;

interface AppShellProps {
  title: string;
  mobileTitle?: string;
  children: React.ReactNode;
}

export function AppShell({ title, mobileTitle, children }: AppShellProps) {
  const { status, user, roles, logout, retry } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const allowed = status === 'authenticated' && canOpen(roles, pathname);

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
    else if (status === 'authenticated' && !allowed) router.replace(homeForRoles(roles));
  }, [status, allowed, roles, router]);

  if (status === 'unavailable') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3.5 p-6 text-center">
        <h1 className="text-[22px] font-bold text-brand">{authLabels.unavailableTitle}</h1>
        <p role="alert">{authLabels.unavailableText}</p>
        <button type="button" className="btn btn-gold" onClick={() => void retry()}>
          {authLabels.retry}
        </button>
      </div>
    );
  }

  if (!allowed || !user) return null;

  const items = navForRoles(roles);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const overflow = items.length > MOBILE_SLOTS;
  const mobilePrimary = overflow ? items.slice(0, MOBILE_SLOTS - 1) : items;
  const mobileMore = overflow ? items.slice(MOBILE_SLOTS - 1) : [];
  const roleSummary = roles.map((role) => roleLabels[role]).join(' · ');

  const handleLogout = () => {
    void logout();
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside className="hidden w-[236px] shrink-0 flex-col gap-1.5 bg-brand px-3.5 py-5 text-white md:flex">
        <div className="px-3 pt-1 pb-3.5 text-xl font-extrabold">
          TCS <b className="text-gold">Reservas</b>
        </div>
        <div className="px-3 pb-2">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <small className="block text-[11px] uppercase opacity-80">{roleSummary}</small>
        </div>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-h-11 items-center rounded-lg px-3 transition-colors hover:bg-white/10',
              isActive(item.href) && 'bg-gold font-bold text-brand-dark hover:bg-gold',
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-1.5 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-left text-sm transition-colors hover:bg-white/10"
          >
            {authLabels.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 bg-brand p-5 text-lg font-bold text-white md:hidden">
          <span className="truncate">{mobileTitle ?? title}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={authLabels.logout}
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          >
            <LogOut className="size-5" aria-hidden />
          </button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pb-24 md:px-[30px] md:py-[22px] md:pb-[22px]">
          <div className="hidden items-center justify-between gap-3 md:flex">
            <h1 className="text-[22px] font-bold text-brand">{title}</h1>
            <span className="rounded-full bg-brand px-2.5 py-[3px] text-xs font-bold text-white">
              {user.fullName}
            </span>
          </div>
          <SanctionBanner />
          <PermissionPrompt />
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 flex border-t border-line bg-white md:hidden"
      >
        {mobilePrimary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMoreOpen(false)}
            className={cn(
              'flex min-h-14 flex-1 items-center justify-center text-xs font-semibold text-brand transition-colors active:bg-soft',
              isActive(item.href) && 'bg-gold text-brand-dark active:bg-gold',
            )}
          >
            {item.shortLabel}
          </Link>
        ))}
        {overflow && (
          <>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                'flex min-h-14 flex-1 cursor-pointer items-center justify-center text-xs font-semibold text-brand transition-colors active:bg-soft',
                (moreOpen || mobileMore.some((item) => isActive(item.href))) &&
                  'bg-gold text-brand-dark active:bg-gold',
              )}
            >
              Más
            </button>
            {moreOpen && (
              <div className="absolute right-2 bottom-full mb-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
                {mobileMore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex min-h-11 items-center px-4 text-sm font-semibold text-brand transition-colors hover:bg-soft',
                      isActive(item.href) && 'bg-gold text-brand-dark hover:bg-gold',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </nav>
    </div>
  );
}
