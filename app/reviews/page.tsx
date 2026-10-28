import { reviewCards } from '@/lib/demo-data';

export default function ReviewsPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Review notes</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Editorial review archive</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reviewCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-xs uppercase tracking-[0.18em] text-teal-700">{card.date}</div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
