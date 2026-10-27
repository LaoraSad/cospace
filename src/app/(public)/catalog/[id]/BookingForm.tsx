'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export function BookingForm({
  spaceId,
  pricePerHour,
}: {
  spaceId: string;
  pricePerHour: number;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('09:00');
  const [duration, setDuration] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatedTotal = Number(duration) * pricePerHour;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!date) {
      setError(t.selectDateError);
      setLoading(false);
      return;
    }

    const [hours] = startHour.split(':').map(Number);
    const start = new Date(`${date}T${startHour}:00`);
    const end = new Date(start);
    end.setHours(hours + Number(duration));

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/catalog/${spaceId}`);
          return;
        }
        setError(data.message || 'Error al procesar la reserva');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Fallo de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBooking} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">{t.dateLabel}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">{t.startHourLabel}</label>
        <select
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => {
            const formatted = `${h < 10 ? '0' : ''}${h}:00`;
            return (
              <option key={formatted} value={formatted}>
                {formatted}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">{t.durationLabel}</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="1">1 {t.hourSingular}</option>
          <option value="2">2 {t.hourPlural}</option>
          <option value="3">3 {t.hourPlural}</option>
          <option value="4">4 {t.hourPlural}</option>
        </select>
      </div>

      <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm">
        <span className="text-neutral-400">{t.totalToPay}</span>
        <span className="text-white font-bold">${calculatedTotal}</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? t.confirmingBooking : t.confirmBooking}
      </button>
    </form>
  );
}