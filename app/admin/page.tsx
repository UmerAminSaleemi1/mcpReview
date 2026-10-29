import Link from 'next/link';

import {
  publishEditorialDraftAction,
  saveEditorialDraftAction,
  saveManualEvidenceAction,
  unpublishEditorialDraftAction,
} from '@/app/admin/actions';
import { getEditorialDashboardData, getEditorialStatusLabel } from '@/lib/admin';
import { canManageEditors, getSessionProfile } from '@/lib/auth';
import { getEditorialDrafts } from '@/lib/editor';

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminPage() {
  const { isLoggedIn, role, user } = await getSessionProfile();

  if (!isLoggedIn || !canManageEditors({ role })) {
    return (
      <div className="container-shell py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm text-amber-900 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Access denied</div>
          <h1 className="mt-3 text-3xl font-semibold">Editor access required</h1>
          <p className="mt-3 leading-6">
            This area is restricted to authenticated editors and administrators. Sign in with a role-approved account to continue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/login?next=/admin" className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
              Sign in
            </Link>
            <Link href="/servers" className="rounded-full border border-amber-300 bg-white px-4 py-2 font-medium text-amber-900">
              Browse public directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { stats, servers, reviews, submissions, error } = await getEditorialDashboardData();
  const drafts = await getEditorialDrafts();

  return (
    <div className="container-shell py-16">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Editorial dashboard</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Review queue and publishing</h1>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          Signed in as <span className="font-semibold text-slate-900">{user?.email ?? 'editor'}</span> · {role}
        </div>
      </div>

      {error ? (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Total listings</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.totalServers}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Published</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.publishedServers}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Drafts</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.draftServers}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Pending reviews</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.pendingReviews}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Moderation queue</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.moderationQueue}</div>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Create a draft listing</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Phase 3 workflow</span>
        </div>
        <form action={saveEditorialDraftAction} className="grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-700 md:col-span-2">
            Listing name
            <input name="name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Example: Acme MCP" />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Short summary
            <textarea name="summary" rows={4} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Keep this factual: what the server does, its scope, and limits." />
          </label>
          <label className="text-sm text-slate-700">
            Category
            <input name="category" defaultValue="General" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" />
          </label>
          <label className="text-sm text-slate-700">
            Slug
            <input name="slug" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="acme-mcp" />
          </label>
          <label className="text-sm text-slate-700">
            Hosting
            <input name="hosting" defaultValue="Unknown" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" />
          </label>
          <label className="text-sm text-slate-700">
            Pricing
            <input name="pricing" defaultValue="Unknown" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Permissions and data access
            <textarea name="permissions" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="List exact access patterns and any data handling limitations. Use Unknown when not yet verified." />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Setup instructions
            <textarea name="setup" rows={4} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Provide setup steps only if they are checked and confirmed. Otherwise leave them unknown or omitted." />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Alternatives or notes
            <textarea name="alternatives" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="List alternatives or caveats, or leave blank for unknown." />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Review summary
            <textarea name="reviewSummary" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="This is the editorial summary, not a fabricated ratable verdict." />
          </label>
          <label className="text-sm text-slate-700">
            Version
            <input name="version" defaultValue="1.0.0" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" />
          </label>
          <label className="text-sm text-slate-700">
            Evidence visibility
            <select name="evidenceVisibility" defaultValue="private" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400">
              <option value="private">Private raw evidence</option>
              <option value="published">Public evidence</option>
              <option value="redacted">Redacted</option>
            </select>
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Evidence approval
            <input type="checkbox" name="evidenceApproved" value="true" className="mt-2 ml-2 h-4 w-4" />
            <span className="ml-2 text-slate-600">I have explicitly approved this file for public publication.</span>
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Evidence file name
            <input name="evidenceName" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="evidence.pdf" />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Evidence MIME type (explicitly validated)
            <input name="evidenceMime" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="application/pdf" />
          </label>
          <button type="submit" className="md:col-span-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Save draft</button>
        </form>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Directory overview</h2>
            <Link href="/servers" className="text-sm font-medium text-teal-700">Open public directory</Link>
          </div>

          {servers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              No server records are currently in the editorial queue.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Listing</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {servers.map((server) => (
                    <tr key={server.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{server.name}</div>
                        <div className="text-xs text-slate-500">/{server.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                          {getEditorialStatusLabel(server.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(server.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Review queue</h2>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">{reviews.length} active</span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              No review drafts or revisions are currently pending.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{review.summary}</div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                      {getEditorialStatusLabel(review.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Version {review.version ?? 'n/a'}</span>
                    <span>Updated {formatDate(review.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Manual test evidence</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Review + evidence</span>
        </div>

        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Save a draft listing first to attach test evidence and review notes.
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <form key={draft.id} action={saveManualEvidenceAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <input type="hidden" name="serverId" value={draft.id} />
                <div className="md:col-span-2 text-sm font-medium text-slate-900">{draft.name}</div>
                <label className="text-sm text-slate-700">
                  Test name
                  <input name="testName" defaultValue={`${draft.name} manual evidence`} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Environment
                  <input name="environment" defaultValue="manual" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Scenario version
                  <input name="scenarioVersion" defaultValue="manual-1" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Status
                  <select name="status" defaultValue="unknown" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400">
                    <option value="not_tested">Not tested</option>
                    <option value="unknown">Unknown</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="partial">Partial</option>
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  Metric name
                  <input name="metricName" defaultValue="manual-check" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Metric value
                  <input name="metricValue" placeholder="e.g. 2.1s" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Result
                  <select name="metricResult" defaultValue="unknown" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400">
                    <option value="not_tested">Not tested</option>
                    <option value="unknown">Unknown</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="partial">Partial</option>
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  Score
                  <input name="score" type="number" step="0.1" placeholder="Optional" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700 md:col-span-2">
                  Notes
                  <textarea name="notes" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Record the exact manual check, known limits, and test context." />
                </label>
                <label className="text-sm text-slate-700">
                  Evidence file name
                  <input name="evidenceName" defaultValue={`${draft.slug}-manual-evidence.pdf`} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Evidence MIME type
                  <input name="evidenceMime" defaultValue="application/pdf" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400" />
                </label>
                <label className="text-sm text-slate-700">
                  Visibility
                  <select name="evidenceVisibility" defaultValue="private" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-400">
                    <option value="private">Private</option>
                    <option value="published">Public evidence</option>
                    <option value="redacted">Redacted</option>
                  </select>
                </label>
                <button type="submit" className="md:col-span-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save manual evidence</button>
              </form>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Draft preview and publishing</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Signed-in review</span>
        </div>

        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No draft listings are currently in the review queue.
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{draft.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">/{draft.slug}</div>
                    <p className="mt-2 max-w-2xl text-sm text-slate-700">{draft.summary}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                    {getEditorialStatusLabel(draft.status)}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">Signed-in preview</div>
                  <div className="mt-2">{draft.reviewSummary || draft.summary}</div>
                  <div className="mt-2 text-xs text-slate-500">Version {draft.version} · Hosting: {draft.hosting} · Pricing: {draft.pricing}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={publishEditorialDraftAction} className="inline-block">
                    <input type="hidden" name="id" value={draft.id} />
                    <input type="hidden" name="name" value={draft.name} />
                    <input type="hidden" name="slug" value={draft.slug} />
                    <input type="hidden" name="summary" value={draft.summary} />
                    <input type="hidden" name="category" value={draft.category} />
                    <input type="hidden" name="hosting" value={draft.hosting} />
                    <input type="hidden" name="pricing" value={draft.pricing} />
                    <input type="hidden" name="permissions" value={draft.permissions} />
                    <input type="hidden" name="setup" value={draft.setup} />
                    <input type="hidden" name="alternatives" value={draft.alternatives} />
                    <input type="hidden" name="reviewSummary" value={draft.reviewSummary} />
                    <input type="hidden" name="version" value={draft.version} />
                    <input type="hidden" name="notes" value={draft.notes} />
                    <input type="hidden" name="evidenceVisibility" value="private" />
                    <input type="hidden" name="evidenceApproved" value="true" />
                    <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Publish</button>
                  </form>

                  <form action={unpublishEditorialDraftAction} className="inline-block">
                    <input type="hidden" name="id" value={draft.id} />
                    <button type="submit" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Unpublish</button>
                  </form>

                  <Link href={draft.status === 'published' ? `/servers/${draft.slug}` : '#'} className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
                    {draft.status === 'published' ? 'Public page' : 'Signed-in preview'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Moderation queue</h2>
          <Link href="/submit" className="text-sm font-medium text-teal-700">Review submissions</Link>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No public submissions are pending moderation.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Submission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{submission.server_name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                        {getEditorialStatusLabel(submission.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(submission.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
