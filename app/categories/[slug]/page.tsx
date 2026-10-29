import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedServers, getPublishedCategories } from '@/lib/supabase';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { items: categories, error: categoriesError } = await getPublishedCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category && !categoriesError) {
    notFound();
  }

  const { items: serverCatalog, error } = await getPublishedServers();
  const results = serverCatalog.filter((server) => server.categorySlug === slug || server.category.toLowerCase() === category?.label.toLowerCase());

  return (
    <div className="container-shell py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Category</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{category?.label ?? 'Category'}</h1>
        <p className="mt-3 text-slate-600">{category?.description ?? 'Published records for this category.'}</p>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {error}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {results.length > 0 ? (
            results.map((server) => (
              <article key={server.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="text-xs uppercase tracking-[0.18em] text-teal-700">{server.status}</div>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{server.name}</h2>
                <p className="mt-3 text-sm text-slate-600">{server.summary}</p>
                <Link href={`/servers/${server.slug}`} className="mt-4 inline-block text-sm font-medium text-teal-700">
                  View server →
                </Link>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600 lg:col-span-3">
              No published servers are listed in this category yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
