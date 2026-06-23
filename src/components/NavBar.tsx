'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavBarProps {
  user: { name: string; email: string };
}

const links = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/files', label: 'Files', icon: '📁' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
];

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl flex items-center h-14 gap-6">
        <span className="text-white font-bold text-lg tracking-tight select-none">🗄️ NAS By WATSON TECH</span>

        <div className="flex items-center gap-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
