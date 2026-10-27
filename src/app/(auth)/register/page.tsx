'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error en el registro');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch {
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">{t.createAccount}</h2>
      <p className="text-xs text-neutral-400 mb-6 text-center">
        {t.registerSubtitle}
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">{t.fullNameLabel}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">{t.emailLabel}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">{t.passwordLabel}</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            placeholder={t.minPasswordPlaceholder}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? t.creatingAccount : t.register}
        </button>
      </form>

      <p className="text-xs text-neutral-400 mt-6 text-center">
        {t.alreadyHaveAccount}{' '}
        <Link href="/login" className="text-amber-500 hover:underline">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
