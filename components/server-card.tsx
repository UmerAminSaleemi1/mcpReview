import Link from 'next/link';
import type { ServerRecord } from '@/lib/demo-data';

export function ServerCard({ server }: { server: ServerRecord }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{server.category}</div>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{server.name}</h3>
        </div>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{server.trustLabel}</span>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-600">{server.summary}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {server.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
            {tag}
          </span>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm text-slate-700">
        <div>
          <dt className="text-slate-500">Price</dt>
          <dd className="font-medium">{server.price}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="font-medium">{server.verdict}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
        <span className="text-slate-500">Reviewed {server.reviewed}</span>
        <Link href={`/servers/${server.slug}`} className="font-medium text-teal-700 hover:text-teal-800">
          View details →
        </Link>
      </div>
    </article>
  );
}
