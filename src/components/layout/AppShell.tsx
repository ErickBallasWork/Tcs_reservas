'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { roleLabels } from '@/lib/labels';
import { homeForRoles, navForRoles } from '@/lib/nav';
import { REQUIRE_NOTIFICATIONS, useNotificationPermission } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import type { Role } from '@/api/types';

const MOBILE_SLOTS = 4;

interface AppShellProps {
  title: string;
  mobileTitle?: string;
  children: React.ReactNode;
}

export function AppShell({ title, mobileTitle, children }: AppShellProps) {
  const { role, setRole, ready, session, logout } = useAuth();
  const permission = useNotificationPermission();
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!ready || permission === null) return;
    if (!session) {
      router.replace('/login');
    } else if (REQUIRE_NOTIFICATIONS && permission !== 'granted') {
      logout();
      router.replace('/login');
    }
  }, [ready, permission, session, router, logout]);

  const hasAccess =
    ready &&
    permission !== null &&
    !!session &&
    (!REQUIRE_NOTIFICATIONS || permission === 'granted');

  if (!hasAccess) return null;

  const items = navForRoles([role]);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const overflow = items.length > MOBILE_SLOTS;
  const mobilePrimary = overflow ? items.slice(0, MOBILE_SLOTS - 1) : items;
  const mobileMore = overflow ? items.slice(MOBILE_SLOTS - 1) : [];

  const handleRoleChange = (next: Role) => {
    setRole(next);
    setMoreOpen(false);
    router.push(homeForRoles([next]));
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const roleSelect = (
    <select
      aria-label="Cambiar rol (demo)"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value as Role)}
      className="min-h-11 w-full cursor-pointer rounded-lg border border-white/30 bg-white/10 px-3 text-sm text-white transition-colors hover:bg-white/20 [&>option]:text-ink"
    >
      {(Object.keys(roleLabels) as Role[]).map((r) => (
        <option key={r} value={r}>
          {roleLabels[r]}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      <aside className="hidden w-[236px] shrink-0 flex-col gap-1.5 bg-brand px-3.5 py-5 text-white md:flex">
        <div className="px-3 pt-1 pb-3.5 text-xl font-extrabold">
          TCS <b className="text-gold">Reservas</b>
        </div>
        <small className="px-3 pb-2 text-[11px] uppercase opacity-80">{roleLabels[role]}</small>
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
          <small className="block px-1 text-[11px] uppercase opacity-60">Rol (demo)</small>
          {roleSelect}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-left text-sm transition-colors hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 bg-brand p-5 text-lg font-bold text-white md:hidden">
          <span>{mobileTitle ?? title}</span>
          <div className="w-36 text-sm font-normal">{roleSelect}</div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pb-24 md:px-[30px] md:py-[22px] md:pb-[22px]">
          <div className="hidden items-center justify-between gap-3 md:flex">
            <h1 className="text-[22px] font-bold text-brand">{title}</h1>
            <span className="rounded-full bg-brand px-2.5 py-[3px] text-xs font-bold text-white">
              {roleLabels[role]}
            </span>
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-line bg-white md:hidden">
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
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                'flex min-h-14 flex-1 cursor-pointer items-center justify-center text-xs font-semibold text-brand transition-colors active:bg-soft',
                (moreOpen || mobileMore.some((i) => isActive(i.href))) &&
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
