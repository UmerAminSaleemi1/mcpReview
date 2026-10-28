import Link from 'next/link';
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Boxes } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ServerCard } from '@/components/server-card';
import { reviewCards } from '@/lib/demo-data';
import { getPublishedServers } from '@/lib/supabase';

export default async function HomePage() {
  const serverCatalog = await getPublishedServers();

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-teal-50/70">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Demo data • local only
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Find the right MCP server. <span className="text-teal-700">See it tested before you connect.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Browse evidence-backed listings, compare options, and review how permissions, setup complexity, and compatibility are handled.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/servers" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
                Browse servers <ArrowRight size={16} />
              </Link>
              <Link href="/how-we-test" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-400">
                How we review
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="text-teal-700" size={16} /> Public browsing</div>
              <div className="flex items-center gap-2"><ShieldCheck className="text-teal-700" size={16} /> Verified evidence</div>
              <div className="flex items-center gap-2"><Boxes className="text-teal-700" size={16} /> Clear comparison</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-500">Quick search</div>
              <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Demo mode</div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                defaultValue="context + project memory"
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
                aria-label="Quick search demo"
              />
            </label>

            <div className="mt-5 space-y-3">
              {serverCatalog.slice(0, 3).map((server) => (
                <div key={server.slug} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
                  <div>
                    <div className="font-medium text-slate-800">{server.name}</div>
                    <div className="text-xs text-slate-500">{server.category}</div>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">
                    {server.verdict}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeading
          eyebrow="Why MCPList"
          title="A directory designed around evidence, not hype."
          description="Every review is separated from publisher claims so visitors can spot what is verified, what is untested, and what is still unknown."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">01</div>
            <h3 className="text-lg font-semibold text-slate-900">Trust labels</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reviewed, unknown, and not tested remain explicit states instead of being stretched into unsupported claims.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">02</div>
            <h3 className="text-lg font-semibold text-slate-900">Permission clarity</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Every listing keeps setup instructions and access scope readable, so teams can judge risk before connecting tools.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">03</div>
            <h3 className="text-lg font-semibold text-slate-900">Compare carefully</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The compare flow highlights actual structured fields, date-stamped evidence, and areas where the answer is still unknown.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured servers"
            title="A small, honest set of reviewed examples"
            description="These listings are demo fixtures used to validate the layout and information hierarchy in Phase 1."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {serverCatalog.map((server) => (
              <ServerCard key={server.slug} server={server} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionHeading
          eyebrow="Latest reviews"
          title="Editorial notes and methodology updates"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {reviewCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Review</div>
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.summary}</p>
              <div className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{card.date}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
