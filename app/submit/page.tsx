export default function SubmitPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Submit</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Suggest a new MCP server</h1>
      </div>

      <form className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Server name
            <input type="text" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Example: Docs MCP" />
          </label>
          <label className="text-sm text-slate-700">
            Website or repo
            <input type="url" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="https://example.com" />
          </label>
          <label className="md:col-span-2 text-sm text-slate-700">
            Short summary
            <textarea rows={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Describe the server and intended use case." />
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This form is intentionally not connected to production workflows yet. It demonstrates the submission UI without claiming success.
        </div>

        <button type="button" className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
          Submit for review
        </button>
      </form>
    </div>
  );
}
