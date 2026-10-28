import Link from 'next/link';
import { serverCatalog } from '@/lib/demo-data';

const selected = serverCatalog.slice(0, 3);

export default function ComparePage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Comparison</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Compare MCP servers</h1>
      </div>

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
                <td className="rounded-l-xl px-4 py-3 font-medium">Verdict</td>
                {selected.map((server) => (
                  <td key={server.slug} className="px-4 py-3">{server.verdict}</td>
                ))}
              </tr>
              <tr className="bg-slate-50 text-sm text-slate-700">
                <td className="rounded-l-xl px-4 py-3 font-medium">Price</td>
                {selected.map((server) => (
                  <td key={server.slug} className="px-4 py-3">{server.price}</td>
                ))}
              </tr>
              <tr className="bg-slate-50 text-sm text-slate-700">
                <td className="rounded-l-xl px-4 py-3 font-medium">Hosting</td>
                {selected.map((server) => (
                  <td key={server.slug} className="px-4 py-3">{server.hosting}</td>
                ))}
              </tr>
              <tr className="bg-slate-50 text-sm text-slate-700">
                <td className="rounded-l-xl px-4 py-3 font-medium">Primary clients</td>
                {selected.map((server) => (
                  <td key={server.slug} className="px-4 py-3">{server.clients.join(', ')}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-sm text-slate-600">
        Demo comparison only: values are local fixtures and not production evidence.
      </div>

      <div className="mt-8">
        <Link href="/servers" className="text-teal-700">← Back to servers</Link>
      </div>
    </div>
  );
}
