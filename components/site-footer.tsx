import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 text-lg font-semibold text-slate-900">MCPList</div>
          <p className="text-sm leading-6 text-slate-600">
            Find the right MCP server. See it tested before you connect.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Explore</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><Link href="/servers">Servers</Link></li>
            <li><Link href="/compare">Compare</Link></li>
            <li><Link href="/reviews">Reviews</Link></li>
            <li><Link href="/guides">Guides</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Company</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/how-we-test">How we test</Link></li>
            <li><Link href="/submit">Submit</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Legal</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
