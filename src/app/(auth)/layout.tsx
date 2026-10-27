import Link from 'next/link';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-950 p-4">
      <div className="absolute top-6 right-6">
        <LanguageSelector />
      </div>
      <div className="mb-6 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          CoSpace
        </Link>
      </div>
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}