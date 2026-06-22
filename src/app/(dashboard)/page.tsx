import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import Link from 'next/link';

async function getStats(userId: string) {
  const [filesResult, eventsResult, foldersResult] = await Promise.all([
    pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(size), 0) as total_size FROM files WHERE owner_id = $1',
      [userId]
    ),
    pool.query(
      'SELECT COUNT(*) as count FROM calendar_events WHERE owner_id = $1',
      [userId]
    ),
    pool.query(
      'SELECT COUNT(*) as count FROM folders WHERE owner_id = $1',
      [userId]
    ),
  ]);

  return {
    files: parseInt(filesResult.rows[0].count),
    totalSize: parseInt(filesResult.rows[0].total_size),
    events: parseInt(eventsResult.rows[0].count),
    folders: parseInt(foldersResult.rows[0].count),
  };
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getStats(session!.user.id);

  const cards = [
    { label: 'Files', value: stats.files, sub: formatBytes(stats.totalSize) + ' used', href: '/files', icon: '📁', color: 'blue' },
    { label: 'Folders', value: stats.folders, sub: 'Directories', href: '/files', icon: '🗂️', color: 'purple' },
    { label: 'Events', value: stats.events, sub: 'Calendar entries', href: '/calendar', icon: '📅', color: 'green' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {session!.user.name}</h1>
        <p className="text-gray-400 mt-1">Here&apos;s an overview of your storage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">{card.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/files"
          className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6 hover:bg-blue-900/30 transition-colors flex items-center gap-4"
        >
          <div className="text-4xl">📂</div>
          <div>
            <div className="text-lg font-semibold text-white">File Manager</div>
            <div className="text-sm text-gray-400">Upload, browse and share files</div>
          </div>
        </Link>
        <Link
          href="/calendar"
          className="bg-green-900/20 border border-green-800/50 rounded-xl p-6 hover:bg-green-900/30 transition-colors flex items-center gap-4"
        >
          <div className="text-4xl">📅</div>
          <div>
            <div className="text-lg font-semibold text-white">Calendar</div>
            <div className="text-sm text-gray-400">Manage personal and shared events</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
