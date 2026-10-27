'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/lib/i18n';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUserName(data.user?.name ?? null))
      .catch(() => setUserName(null));
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/80 p-6 flex flex-col justify-between">
        <div>
          <div className="text-lg font-bold text-amber-500 mb-6 flex items-center gap-2">
            <span>🛡️</span> {t.brand} Admin
          </div>
          {userName && (
            <div className="mb-6 flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 px-3 py-2 rounded-lg text-xs text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold truncate">{userName}</span>
            </div>
          )}
          <nav className="flex flex-col gap-3 text-sm">
            <Link href="/admin" className="text-neutral-300 hover:text-white p-2 rounded bg-neutral-800/60">
              {t.manageSpaces}
            </Link>
            <Link href="/catalog" className="text-neutral-400 hover:text-white p-2">
              {t.viewPublicCatalog}
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <LanguageSelector />
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full text-left text-sm text-red-400 hover:text-red-300">
              {t.logoutAdmin}
            </button>
          </form>
       </div>
      </aside>
      <main className="flex-1 p-8 bg-neutral-950 overflow-y-auto">{children}</main>
    </div>
  );
}