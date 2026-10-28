export default function HowWeTestPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Methodology</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">How we test and review MCP servers</h1>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">1. Scope the claim</h2>
          <p className="mt-3 text-slate-600">We first identify what the server claims to support: client compatibility, file access, permissions, installation method, and pricing.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">2. Separate claims from evidence</h2>
          <p className="mt-3 text-slate-600">Publisher claims are stored separately from verified outcomes so visitors can compare them directly.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">3. Label uncertainty honestly</h2>
          <p className="mt-3 text-slate-600">If a field is not tested or remains unknown, the page clearly states that. We do not convert unknown into success or failure.</p>
        </section>
      </div>
    </div>
  );
}
