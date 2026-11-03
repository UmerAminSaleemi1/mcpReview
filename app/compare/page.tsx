import Link from 'next/link';

import { buildCompareIds } from '@/lib/search';
import { getPublishedServersForComparison } from '@/lib/supabase';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawValues = Array.isArray(params.servers) ? params.servers : [params.servers];
  const selectedSlugs = buildCompareIds(rawValues);
  const { items: selected, error } = await getPublishedServersForComparison(selectedSlugs);

  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Comparison</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Compare MCP servers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Compare up to three published servers side by side. Claimed compatibility and tested compatibility are shown separately, and missing information remains Unknown instead of being guessed.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      ) : selected.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Choose up to three published servers from the directory to compare them side by side.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-6 flex flex-wrap gap-3">
            {selected.map((server) => (
              <div key={server.slug} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                {server.name}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-3 font-medium">Field</th>
                  {selected.map((server) => (
                    <th key={server.slug} className="px-4 py-3 font-medium">{server.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Category</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.category || 'Unknown'}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Price</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.pricing || 'Unknown'}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Hosting</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.hosting || 'Unknown'}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Claimed clients</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">
                      {server.clients.length > 0
                        ? server.clients.map((client) => `${client.label}${client.claimedSupport ? ' (claimed)' : ''}`).join(', ')
                        : 'Unknown'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Tested compatibility</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">
                      {server.clients.some((client) => client.testedSupport)
                        ? server.clients.filter((client) => client.testedSupport).map((client) => client.label).join(', ')
                        : 'Not tested'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Last reviewed</td>
                  {selected.map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.reviewedAt ? new Date(server.reviewedAt).toLocaleDateString() : 'Unknown'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 text-sm">
        <Link href="/servers" className="text-teal-700">← Back to servers</Link>
        <Link href="/submit" className="text-teal-700">Submit a correction</Link>
      </div>
    </div>
  );
}
