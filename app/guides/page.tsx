import Link from 'next/link';
import { guides } from '@/lib/demo-data';

export default function GuidesPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Guides</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">MCP setup and evaluation guides</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {guides.map((guide) => (
          <article key={guide.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">{guide.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guide.summary}</p>
            <Link href={`/guides/${guide.slug}`} className="mt-5 inline-block text-sm font-medium text-teal-700">
              Read guide →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
