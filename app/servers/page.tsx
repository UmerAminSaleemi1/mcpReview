import Link from 'next/link';
import { Search } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ServerCard } from '@/components/server-card';
import { getPublishedServers } from '@/lib/supabase';

export default async function ServersPage() {
  const { items: serverCatalog, error } = await getPublishedServers();

  return (
    <div className="container-shell py-12">
      <SectionHeading
        eyebrow="Directory"
        title="Browse MCP servers"
        description="Filter by category, hosting model, and publication status. The directory reflects the current published records only."
      />

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 lg:flex-1">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              defaultValue={serverCatalog[0]?.name ?? 'No published servers yet'}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Search the server directory"
            />
          </label>

          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2">All</button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2">Productivity</button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2">Data</button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2">Automation</button>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">Published</span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5">Unpublished</span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      ) : serverCatalog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          No published servers are available yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {serverCatalog.map((server) => (
            <ServerCard key={server.slug} server={server} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between text-sm text-slate-600">
        <Link href="/" className="text-teal-700">Back home</Link>
        <Link href="/compare" className="text-teal-700">Compare servers</Link>
      </div>
    </div>
  );
}
