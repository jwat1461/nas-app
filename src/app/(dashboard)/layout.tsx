import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NavBar from '@/components/NavBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <NavBar user={session.user} />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">{children}</main>
    </div>
  );
}
