import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedServerBySlug } from '@/lib/supabase';

export default async function ServerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { item: server, error } = await getPublishedServerBySlug(slug);

  if (error) {
    return (
      <div className="container-shell py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      </div>
    );
  }

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
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">{server.status}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            <p className="mt-3 text-slate-600">{server.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Pricing</div>
                <div className="mt-2 font-medium text-slate-900">{server.pricing}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Hosting</div>
                <div className="mt-2 font-medium text-slate-900">{server.hosting}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Published</div>
                <div className="mt-2 font-medium text-slate-900">{server.publishedAt ? new Date(server.publishedAt).toLocaleDateString() : 'Unknown'}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Capabilities</h2>
            {server.capabilities.length > 0 ? (
              <ul className="mt-4 space-y-2 text-slate-600">
                {server.capabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-teal-600" />{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No capability list is published yet.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Permissions and data access</h2>
            {server.permissions.length > 0 ? (
              <ul className="mt-4 space-y-2 text-slate-600">
                {server.permissions.map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-slate-600" />{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No permission details are currently published.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Setup instructions</h2>
            {server.setup.length > 0 ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
                {server.setup.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No setup steps are published yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Clients</h3>
            {server.clients.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {server.clients.map((client) => (
                  <li key={client.slug} className="rounded-lg bg-white px-3 py-2 border border-slate-200">
                    <div className="font-medium">{client.label}</div>
                    <div className="text-xs text-slate-500">Claimed support: {client.claimedSupport ? 'Yes' : 'No'} • Tested support: {client.testedSupport ? 'Yes' : 'No'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No client support rows are published yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">References</h3>
            {server.refs.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {server.refs.map((ref) => (
                  <li key={ref}>{ref}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No public references are published yet.</p>
            )}
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
