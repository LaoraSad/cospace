'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/lib/i18n';

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/catalog" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            {t.brand}
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/catalog"
              className={
                pathname.startsWith('/catalog')
                  ? 'text-amber-500 border-b-2 border-amber-500 pb-1 font-semibold transition-colors'
                  : 'text-neutral-300 hover:text-amber-400 transition-colors'
              }
            >
              {t.catalog}
            </Link>
            <Link
              href="/dashboard"
              className={
                pathname.startsWith('/dashboard')
                  ? 'text-amber-500 border-b-2 border-amber-500 pb-1 font-semibold transition-colors'
                  : 'text-neutral-300 hover:text-amber-400 transition-colors'
              }
            >
              {t.dashboard}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={
                  pathname.startsWith('/admin')
                    ? 'text-amber-500 border-b-2 border-amber-500 pb-1 font-semibold transition-colors'
                    : 'text-neutral-300 hover:text-amber-400 transition-colors'
                }
              >
                {t.admin}
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 px-3 py-1.5 rounded-full text-xs text-neutral-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold">{user.name}</span>
              </div>
            )}
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-red-400 hover:text-red-300">
                {t.exit}
              </button>
            </form>
            <LanguageSelector />
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">{children}</main>
    </div>
  );
}
