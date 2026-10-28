import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides } from '@/lib/demo-data';

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="container-shell py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Guide</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{guide.title}</h1>
        <p className="mt-3 text-slate-600">{guide.summary}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Checklist</h2>
        <ul className="mt-4 space-y-2 text-slate-600">
          <li>• Confirm the server is actually needed for the task you are automating.</li>
          <li>• Review permissions, hosting model, and data-access scope before connecting.</li>
          <li>• Check whether the review is independently verified and date-stamped.</li>
          <li>• Compare at least two alternatives before committing to production usage.</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link href="/guides" className="text-teal-700">← Back to guides</Link>
      </div>
    </div>
  );
}
