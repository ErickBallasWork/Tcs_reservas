"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { homeByRole, navByRole } from "@/lib/nav";
import { roleLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const MOBILE_SLOTS = 4;

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  const { role, setRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = navByRole[role];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Mobile: if there are more than 4 items, show 3 + a "Más" button
  const overflow = items.length > MOBILE_SLOTS;
  const mobilePrimary = overflow ? items.slice(0, MOBILE_SLOTS - 1) : items;
  const mobileMore = overflow ? items.slice(MOBILE_SLOTS - 1) : [];

  const handleRoleChange = (next: Role) => {
    setRole(next);
    setMoreOpen(false);
    router.push(homeByRole[next]);
  };

  // Temporary selector to test every role without a real login
  const roleSelect = (
    <select
      aria-label="Cambiar rol (demo)"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value as Role)}
      className="min-h-11 w-full rounded-lg border border-white/30 bg-white/10 px-3 text-sm text-white [&>option]:text-ink"
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
      {/* Desktop sidebar */}
      <aside className="hidden w-[236px] shrink-0 flex-col gap-1.5 bg-brand px-3.5 py-5 text-white md:flex">
        <div className="px-3 pb-3.5 pt-1 text-xl font-extrabold">
          TCS <b className="text-gold">Reservas</b>
        </div>
        <small className="px-3 pb-2 text-[11px] uppercase opacity-80">
          {roleLabels[role]}
        </small>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-11 items-center rounded-lg px-3",
              isActive(item.href) && "bg-gold font-bold text-brand-dark",
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <small className="block px-1 pb-1 text-[11px] uppercase opacity-60">
            Rol (demo)
          </small>
          {roleSelect}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between gap-3 bg-brand p-5 text-lg font-bold text-white md:hidden">
          <span>{title}</span>
          <div className="w-36 text-sm font-normal">{roleSelect}</div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pb-24 md:px-[30px] md:py-[22px] md:pb-[22px]">
          {/* Desktop title + role tag */}
          <div className="hidden items-center justify-between gap-3 md:flex">
            <h1 className="text-[22px] font-bold text-brand">{title}</h1>
            <span className="rounded-full bg-brand px-2.5 py-[3px] text-xs font-bold text-white">
              {roleLabels[role]}
            </span>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-line bg-white md:hidden">
        {mobilePrimary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex min-h-14 flex-1 items-center justify-center text-xs font-semibold text-brand",
              isActive(item.href) && "bg-gold text-brand-dark",
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
                "flex min-h-14 flex-1 items-center justify-center text-xs font-semibold text-brand",
                (moreOpen || mobileMore.some((i) => isActive(i.href))) &&
                  "bg-gold text-brand-dark",
              )}
            >
              Más
            </button>
            {moreOpen && (
              <div className="absolute bottom-full right-2 mb-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
                {mobileMore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center px-4 text-sm font-semibold text-brand",
                      isActive(item.href) && "bg-gold text-brand-dark",
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
