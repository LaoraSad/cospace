import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata = {
  title: 'CoSpace | Plataforma de Coworking',
  description: 'Reserva de escritorios, salas y cabinas por horas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}