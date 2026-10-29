import Link from 'next/link';
import { getPublishedServers } from '@/lib/supabase';

export default async function ComparePage() {
  const { items: selected, error } = await getPublishedServers();

  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Comparison</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Compare MCP servers</h1>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      ) : selected.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          No published servers are available for comparison yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-6 flex flex-wrap gap-3">
            {selected.slice(0, 3).map((server) => (
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
                  {selected.slice(0, 3).map((server) => (
                    <th key={server.slug} className="px-4 py-3 font-medium">{server.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Status</td>
                  {selected.slice(0, 3).map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.status}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Price</td>
                  {selected.slice(0, 3).map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.pricing}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Hosting</td>
                  {selected.slice(0, 3).map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.hosting}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-sm text-slate-700">
                  <td className="rounded-l-xl px-4 py-3 font-medium">Primary clients</td>
                  {selected.slice(0, 3).map((server) => (
                    <td key={server.slug} className="px-4 py-3">{server.clients.map((client) => client.label).join(', ') || 'Unknown'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/servers" className="text-teal-700">← Back to servers</Link>
      </div>
    </div>
  );
}
