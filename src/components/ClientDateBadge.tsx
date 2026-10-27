'use client';

import React, { useSyncExternalStore } from 'react';
import { useTranslation } from '@/lib/i18n';

interface ClientDateBadgeProps {
  dateString: string;
}

// Suscripción vacía fija para detectar montaje en cliente
const emptySubscribe = () => () => {};

export const ClientDateBadge: React.FC<ClientDateBadgeProps> = ({ dateString }) => {
  const { lang, t } = useTranslation();

  // Retorna false en SSR y true en el cliente tras el montaje, sin disparar efectos en cascada
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return <span className="text-neutral-500 text-xs">{t.loadingLocalDate}</span>;
  }

  const localDate = new Date(dateString);
  const formatted = localDate.toLocaleString(lang === 'en' ? 'en-US' : 'es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded">
      🕒 {formatted}
    </span>
  );
};
