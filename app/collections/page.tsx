import Link from 'next/link';
import { collections } from '@/lib/demo-data';

export default function CollectionsPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Collections</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Curated collections</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <article key={collection.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">{collection.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{collection.description}</p>
            <Link href={`/collections/${collection.slug}`} className="mt-5 inline-block text-sm font-medium text-teal-700">
              Read collection →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
