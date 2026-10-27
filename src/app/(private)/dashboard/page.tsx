'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClientDateBadge } from '@/components/ClientDateBadge';
import { useTranslation } from '@/lib/i18n';

interface SpaceInfo {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
}

interface BookingItem {
  id: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  space: SpaceInfo;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) {
          throw new Error('Error al obtener datos');
        }
        const data = await res.json();
        if (isMounted) {
          setBookings(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setActionError('Error al cargar reservas');
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t.confirmCancel)) return;
    setActionError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.message || 'No se pudo cancelar');
        return;
      }

      // Actualizar listado localmente tras cancelación
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch {
      setActionError('Fallo de red al cancelar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.dashboard}</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {t.dashboardSubtitle}
          </p>
        </div>
        <Link
          href="/catalog"
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {t.newBooking}
        </Link>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="text-neutral-500 text-sm py-10 text-center">{t.loadingBookings}</div>
      ) : bookings.length === 0 ? (
        <div className="border border-neutral-800 rounded-xl p-12 text-center bg-neutral-900/40">
          <p className="text-neutral-400 text-sm mb-4">{t.noActiveBookings}</p>
          <Link
            href="/catalog"
            className="text-amber-500 hover:underline text-xs font-semibold"
          >
            {t.exploreSpacesCatalog}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancellable =
              isConfirmed &&
              new Date().getTime() < new Date(b.startTime).getTime() - 2 * 60 * 60 * 1000;

            return (
              <div
                key={b.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {isConfirmed ? t.confirmedStatus : t.cancelledStatus}
                    </span>
                    <span className="text-xs text-neutral-400 font-semibold">{b.space.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{b.space.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                    <div>
                      <span className="text-neutral-500 mr-1">{t.startLabel}</span>
                      <ClientDateBadge dateString={b.startTime} />
                    </div>
                    <div>
                      <span className="text-neutral-500 mr-1">{t.endLabel}</span>
                      <ClientDateBadge dateString={b.endTime} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 block">{t.totalCharged}</span>
                    <span className="text-lg font-bold text-white">${b.totalPrice}</span>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={!isCancellable}
                      title={!isCancellable ? t.cancelTooltipDisabled : t.cancelTooltipEnabled}
                      className="bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {t.cancelBooking}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
