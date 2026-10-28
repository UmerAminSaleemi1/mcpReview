import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedServerBySlug } from '@/lib/supabase';

export default async function ServerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await getPublishedServerBySlug(slug);

  if (!server) {
    notFound();
  }

  return (
    <div className="container-shell py-12">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{server.category}</div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{server.name}</h1>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">{server.trustLabel}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Verdict</h2>
            <p className="mt-3 text-slate-600">{server.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Funding</div>
                <div className="mt-2 font-medium text-slate-900">{server.price}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Hosting</div>
                <div className="mt-2 font-medium text-slate-900">{server.hosting}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</div>
                <div className="mt-2 font-medium text-slate-900">{server.verdict}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Capabilities</h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              {server.capabilities.map((item) => (
                <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600" />{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Permissions and data access</h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              {server.permissions.map((item) => (
                <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-slate-600" />{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Setup instructions</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
              {server.setup.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Clients</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {server.clients.map((client) => (
                <li key={client} className="rounded-lg bg-white px-3 py-2 border border-slate-200">{client}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>Reviewed: {server.reviewed}</li>
              <li>Claimed compatibility: client support listed above</li>
              <li>Tested compatibility: demo review only</li>
              <li>Pricing checked date: {server.reviewed}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">References</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {server.refs.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/servers" className="text-teal-700">← Browse directory</Link>
        <Link href="/compare" className="text-teal-700">Compare alternatives</Link>
      </div>
    </div>
  );
}
