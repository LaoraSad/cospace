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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (active) {
          setUser(data.user ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={user ? '/catalog' : '/'}
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            {t.brand}
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {user ? (
              <>
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
                {user.role === 'ADMIN' && (
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
                <div className="flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 px-3 py-1.5 rounded-full text-xs text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="text-red-400 hover:text-red-300 transition-colors">
                    {t.exit}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={
                    pathname === '/'
                      ? 'text-amber-500 border-b-2 border-amber-500 pb-1 font-semibold transition-colors'
                      : 'text-neutral-300 hover:text-amber-400 transition-colors'
                  }
                >
                  {t.home}
                </Link>
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
                <Link href="/login" className="text-neutral-300 hover:text-amber-400 transition-colors">
                  {t.enter}
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {t.registerNav}
                </Link>
              </>
            )}
            <LanguageSelector />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
        {t.footerRights}
      </footer>
    </div>
  );
}