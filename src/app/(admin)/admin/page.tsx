'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface SpaceItem {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
  isActive: boolean;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario nuevo espacio
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('DESK');
  const [capacity, setCapacity] = useState(1);
  const [pricePerHour, setPricePerHour] = useState(10);
  const [imageUrl, setImageUrl] = useState('');

  // 1. Carga inicial controlada sin disparar renders en cascada
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialSpaces() {
      try {
        const res = await fetch('/api/spaces');
        if (!res.ok) {
          throw new Error('Error al cargar espacios');
        }
        const data = await res.json();
        if (isMounted) {
          setSpaces(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError('Error al consultar espacios');
          setLoading(false);
        }
      }
    }

    fetchInitialSpaces();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Función auxiliar llamada ÚNICAMENTE por acciones del usuario (submit o delete)
  const refreshSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        const data = await res.json();
        setSpaces(data);
      }
    } catch {
      setError('Error al actualizar la lista de espacios');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          capacity: Number(capacity),
          pricePerHour: Number(pricePerHour),
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al crear');
        return;
      }

      setName('');
      setDescription('');
      setImageUrl('');
      await refreshSpaces();
    } catch {
      setError('Fallo de conexión');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm(t.confirmDeactivate)) return;
    setError(null);

    try {
      const res = await fetch(`/api/spaces/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'No se pudo desactivar el espacio');
        return;
      }

      await refreshSpaces();
    } catch {
      setError('Error de comunicación');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.adminTitle}</h1>
        <p className="text-xs text-neutral-400 mt-1">{t.adminSubtitle}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Formulario de creación */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          {t.addNewSpace}
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder={t.spaceNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="DESK">{t.deskOption}</option>
            <option value="MEETING_ROOM">{t.meetingRoomOption}</option>
            <option value="BOOTH">{t.boothOption}</option>
          </select>
          <input
            type="number"
            min={1}
            required
            placeholder={t.capacityPlaceholder}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            type="number"
            min={1}
            step="0.5"
            required
            placeholder={t.pricePerHourPlaceholder}
            value={pricePerHour}
            onChange={(e) => setPricePerHour(Number(e.target.value))}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            type="url"
            required
            placeholder={t.imageUrlPlaceholder}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="md:col-span-2 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <textarea
            required
            placeholder={t.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
            rows={2}
          />
          <button
            type="submit"
            className="md:col-span-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {t.saveSpace}
          </button>
        </form>
      </div>

      {/* Listado para gestión */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{t.registeredSpaces}</h2>
        {loading ? (
          <p className="text-neutral-500 text-xs">{t.loadingInventory}</p>
        ) : (
          spaces.map((s) => (
            <div
              key={s.id}
              className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-500 font-bold">{s.type}</span>
                  <span className="text-xs text-neutral-400">{t.capacity}: {s.capacity}</span>
                  <span className="text-xs text-white font-bold">${s.pricePerHour}/h</span>
                </div>
                <h3 className="text-white font-semibold">{s.name}</h3>
              </div>
              <button
                onClick={() => handleDeactivate(s.id)}
                className="bg-neutral-800 hover:bg-red-950 border border-neutral-700 hover:border-red-800 text-xs text-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {t.deactivate}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
