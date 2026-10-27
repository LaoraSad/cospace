import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { BookingForm } from './BookingForm';
import { T } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const space = await prisma.space.findUnique({
    where: { id },
  });

  if (!space || !space.isActive) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative h-80 w-full rounded-2xl overflow-hidden mb-8 border border-neutral-800">
        <Image
          src={space.imageUrl}
          alt={space.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            {space.type} • <T k="capacity" />: {space.capacity} {space.capacity === 1 ? <T k="person" /> : <T k="people" />}
          </span>
          <h1 className="text-3xl font-extrabold text-white">{space.name}</h1>
          <p className="text-neutral-300 leading-relaxed text-sm">{space.description}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit">
          <div className="mb-4">
            <span className="text-xs text-neutral-400"><T k="pricePerHourLabel" /></span>
            <div className="text-3xl font-bold text-white">${space.pricePerHour}</div>
          </div>
          <BookingForm spaceId={space.id} pricePerHour={space.pricePerHour} />
        </div>
      </div>
    </div>
  );
}
