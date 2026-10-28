import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shell py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">This page is not available yet.</h1>
      <p className="mt-4 text-slate-600">The route may be part of a later phase or a local-only placeholder.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        Return home
      </Link>
    </div>
  );
}
