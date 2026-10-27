'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useTranslation();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as 'es' | 'en')}
      className="bg-neutral-800 text-white text-xs border border-neutral-700 rounded-md px-2 py-1 outline-none focus:border-amber-500 cursor-pointer"
    >
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  );
};