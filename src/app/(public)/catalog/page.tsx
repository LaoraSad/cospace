import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { T } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const spaces = await prisma.space.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white"><T k="catalogTitle" /></h1>
        <p className="text-neutral-400 mt-2 text-sm">
          <T k="catalogSubtitle" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col hover:border-neutral-700 transition-all"
          >
            <div className="relative h-48 w-full bg-neutral-800">
              <Image
                src={space.imageUrl}
                alt={space.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-amber-500 font-semibold mb-2">
                  <span>{space.type}</span>
                  <span><T k="capacity" />: {space.capacity} {space.capacity === 1 ? <T k="person" /> : <T k="people" />}</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{space.name}</h2>
                <p className="text-neutral-400 text-sm line-clamp-2">{space.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400"><T k="rate" /></span>
                  <div className="text-lg font-bold text-white">
                    ${space.pricePerHour} <span className="text-xs font-normal text-neutral-400"><T k="perHour" /></span>
                  </div>
                </div>
                <Link
                  href={`/catalog/${space.id}`}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                >
                  <T k="viewDetail" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
