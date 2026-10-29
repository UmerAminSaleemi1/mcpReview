import Link from 'next/link';

import { AuthStatus } from '@/components/auth-status';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/servers', label: 'Servers' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/compare', label: 'Compare' },
  { href: '/guides', label: 'Guides' },
  { href: '/submit', label: 'Submit' },
  { href: '/how-we-test', label: 'Method' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white shadow-soft">
            MC
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">MCPList</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Evidence first</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-teal-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 sm:inline-flex">
            Editor area
          </Link>
          <Link href="/submit" className="hidden rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 sm:inline-flex">
            Submit server
          </Link>
          <AuthStatus />
          <Link href="/servers" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
            Browse servers
          </Link>
        </div>
      </div>
    </header>
  );
}
