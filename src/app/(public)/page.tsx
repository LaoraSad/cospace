import Link from 'next/link';
import { T, HeroSecondaryButton } from '@/lib/i18n';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 rounded-full mb-6">
          <T k="heroBadge" />
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          <T k="heroTitle" /> <span className="text-amber-500"><T k="heroTitleHighlight" /></span>
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
          <T k="heroSubtitle" />
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-amber-500 transition-colors"
          >
            <T k="exploreCatalog" />
          </Link>
          <HeroSecondaryButton />
        </div>
      </div>
    </section>
  );
}