import Link from 'next/link';
import { Search } from 'lucide-react';

import { SectionHeading } from '@/components/section-heading';
import { ServerCard } from '@/components/server-card';
import { buildSearchParams, getSearchStateFromUrl } from '@/lib/search';
import { getPublishedCategories, getPublishedServersForQuery } from '@/lib/supabase';

export default async function ServersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const state = getSearchStateFromUrl(params);
  const [{ items: serverCatalog, error, totalCount, pageSize }, categories] = await Promise.all([
    getPublishedServersForQuery(state),
    getPublishedCategories(),
  ]);

  const filterOptions = {
    categories: categories.items.map((category) => ({ value: category.slug, label: category.label })),
    hosting: ['Self-hosted', 'Cloud-hosted', 'Hybrid', 'Unknown'],
    pricing: ['Free', 'Freemium', 'Paid', 'Unknown'],
    reviewStatus: ['published', 'review', 'draft'],
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="container-shell py-12">
      <SectionHeading
        eyebrow="Directory"
        title="Browse MCP servers"
        description="Filter by category, hosting model, pricing, compatibility, and review status. Public reads display only published listings."
      />

      <form method="get" className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              name="query"
              defaultValue={state.query}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Search the server directory"
              placeholder="Search by keyword or capability"
            />
          </label>

          <select name="category" defaultValue={state.category} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none">
            <option value="">All categories</option>
            {filterOptions.categories.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select name="hosting" defaultValue={state.hosting} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none">
            <option value="">All hosting</option>
            {filterOptions.hosting.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select name="pricing" defaultValue={state.pricing} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none">
            <option value="">Any pricing</option>
            {filterOptions.pricing.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select name="status" defaultValue={state.status} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none lg:col-span-2">
            <option value="">All review states</option>
            {filterOptions.reviewStatus.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select name="sort" defaultValue={state.sort} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none lg:col-span-1">
            <option value="relevance">Relevance</option>
            <option value="name">Name</option>
            <option value="published_at">Newest</option>
            <option value="reviewed_at">Reviewed</option>
          </select>

          <div className="flex items-center gap-2 lg:col-span-1">
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Apply</button>
            <Link href="/servers" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Reset</Link>
          </div>
        </div>
      </form>

      {error ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">Published only</span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5">Claimed support differs from tested support</span>
      </div>

      {serverCatalog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          No published listings match the current query. Try a broader keyword, a different category, or clear the filters.
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {serverCatalog.map((server) => (
              <ServerCard key={server.slug} server={server} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Page {state.page} of {totalPages} · {totalCount} listings
            </div>
            <div className="flex gap-2">
              {state.page > 1 ? (
                <Link
                  href={`/servers?${buildSearchParams({ ...state, page: state.page - 1 })}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700"
                >
                  Previous
                </Link>
              ) : null}
              {state.page < totalPages ? (
                <Link
                  href={`/servers?${buildSearchParams({ ...state, page: state.page + 1 })}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-between text-sm text-slate-600">
        <Link href="/" className="text-teal-700">Back home</Link>
        <Link href="/compare" className="text-teal-700">Compare servers</Link>
      </div>
    </div>
  );
}
