import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'NAS Storage',
  description: 'Personal network-attached storage with calendar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
