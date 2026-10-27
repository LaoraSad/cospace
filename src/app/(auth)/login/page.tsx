'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      if (redirectPath && redirectPath.startsWith('/')) {
        router.push(redirectPath);
      } else if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">{t.login}</h2>
      <p className="text-xs text-neutral-400 mb-6 text-center">
        {t.loginSubtitle}
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">{t.emailLabel}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder="usuario@cospace.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">{t.passwordLabel}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? t.loggingIn : t.login}
        </button>
      </form>

      <p className="text-xs text-neutral-400 mt-6 text-center">
        {t.noAccount}{' '}
        <Link href="/register" className="text-amber-500 hover:underline">
          {t.registerHere}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-neutral-400 text-xs text-center py-6">...</div>}>
      <LoginForm />
    </Suspense>
  );
}
