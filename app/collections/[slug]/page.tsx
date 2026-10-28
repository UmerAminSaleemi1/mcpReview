import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collections } from '@/lib/demo-data';

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container-shell py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Collection</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{collection.title}</h1>
        <p className="mt-3 text-slate-600">{collection.description}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
        This collection is intentionally empty in Phase 1 and will be populated during later content phases.
      </div>

      <div className="mt-8">
        <Link href="/collections" className="text-teal-700">← Back to collections</Link>
      </div>
    </div>
  );
}
