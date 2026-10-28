export default function AboutPage() {
  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">About</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Why MCPList exists</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft text-slate-600">
        MCPList exists to help developers evaluate MCP servers with explicit evidence, permissions, and setup context. The product is designed to reduce guesswork and make important tradeoffs visible before a tool is connected.
      </div>
    </div>
  );
}
