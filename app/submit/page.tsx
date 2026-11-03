'use client';

import { useEffect, useRef, useState } from 'react';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function SubmitPage() {
  const [submitStatus, setSubmitStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string } | null>(null);
  const [reportStatus, setReportStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string } | null>(null);
  const [submissionCaptchaToken, setSubmissionCaptchaToken] = useState('');
  const [issueCaptchaToken, setIssueCaptchaToken] = useState('');
  const submissionCaptchaRef = useRef<HTMLDivElement | null>(null);
  const issueCaptchaRef = useRef<HTMLDivElement | null>(null);
  const submissionWidgetId = useRef<string | null>(null);
  const issueWidgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey) {
      return;
    }

    const ensureWidget = (
      ref: React.MutableRefObject<HTMLDivElement | null>,
      setToken: (value: string) => void,
      widgetIdRef: React.MutableRefObject<string | null>,
    ) => {
      if (!ref.current || !window.turnstile) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => setToken(token),
        'error-callback': () => setToken(''),
      });
    };

    if (!document.querySelector('script[data-turnstile="true"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      script.onload = () => {
        ensureWidget(submissionCaptchaRef, setSubmissionCaptchaToken, submissionWidgetId);
        ensureWidget(issueCaptchaRef, setIssueCaptchaToken, issueWidgetId);
      };
      document.body.appendChild(script);
      return;
    }

    ensureWidget(submissionCaptchaRef, setSubmissionCaptchaToken, submissionWidgetId);
    ensureWidget(issueCaptchaRef, setIssueCaptchaToken, issueWidgetId);
  }, []);

  async function handleSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('captchaToken', submissionCaptchaToken);

    const response = await fetch('/api/submissions', {
      method: 'POST',
      body: formData,
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok) {
      setSubmitStatus({ type: 'error', message: payload.message ?? 'Submission failed.' });
      if (window.turnstile && submissionWidgetId.current) {
        window.turnstile.reset(submissionWidgetId.current);
      }
      setSubmissionCaptchaToken('');
      return;
    }

    setSubmitStatus({ type: 'success', message: payload.message ?? 'Submitted for moderation.' });
    event.currentTarget.reset();
    if (window.turnstile && submissionWidgetId.current) {
      window.turnstile.reset(submissionWidgetId.current);
    }
    setSubmissionCaptchaToken('');
  }

  async function handleCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('captchaToken', issueCaptchaToken);

    const response = await fetch('/api/issues', {
      method: 'POST',
      body: formData,
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok) {
      setReportStatus({ type: 'error', message: payload.message ?? 'Report failed to save.' });
      if (window.turnstile && issueWidgetId.current) {
        window.turnstile.reset(issueWidgetId.current);
      }
      setIssueCaptchaToken('');
      return;
    }

    setReportStatus({ type: 'success', message: payload.message ?? 'Issue report queued for moderation.' });
    event.currentTarget.reset();
    if (window.turnstile && issueWidgetId.current) {
      window.turnstile.reset(issueWidgetId.current);
    }
    setIssueCaptchaToken('');
  }

  return (
    <div className="container-shell py-12">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Submit</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Suggest a new server or correction</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmission} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-5 text-lg font-semibold text-slate-900">New server submission</div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-slate-700 md:col-span-2">
              Server name
              <input name="name" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Example: Docs MCP" />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Website or repo
              <input name="url" type="url" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="https://example.com" />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Contact email
              <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="you@example.com" />
            </label>
            <label className="md:col-span-2 text-sm text-slate-700">
              Summary
              <textarea name="summary" rows={5} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Describe the server, what it does, and the intended use case." />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Contact details remain private and are used for moderation and acknowledgement only. The app does not execute submitted packages or fetch arbitrary project metadata automatically.
          </div>

          {turnstileSiteKey ? (
            <div className="mt-6">
              <div ref={submissionCaptchaRef} className="min-h-[65px]" />
              <input type="hidden" name="captchaToken" value={submissionCaptchaToken} />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Turnstile is not configured in this environment, so submissions are blocked until a valid site key and secret are added.
            </div>
          )}

          {submitStatus ? (
            <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${submitStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {submitStatus.message}
            </div>
          ) : null}

          <button type="submit" className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
            Submit for review
          </button>
        </form>

        <form onSubmit={handleCorrection} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-5 text-lg font-semibold text-slate-900">Correction or issue report</div>
          <div className="grid gap-5">
            <label className="text-sm text-slate-700">
              Server slug or name
              <input name="serverName" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="example-server" />
            </label>
            <label className="text-sm text-slate-700">
              Issue category
              <select name="category" defaultValue="details" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400">
                <option value="details">Details are outdated</option>
                <option value="pricing">Pricing or hosting mismatch</option>
                <option value="compatibility">Compatibility claim conflict</option>
                <option value="security">Security or access concern</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Description
              <textarea name="description" rows={5} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-400" placeholder="Describe the information that is wrong or missing and any evidence you have." />
            </label>
          </div>

          {turnstileSiteKey ? (
            <div className="mt-6">
              <div ref={issueCaptchaRef} className="min-h-[65px]" />
              <input type="hidden" name="captchaToken" value={issueCaptchaToken} />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Turnstile is not configured in this environment, so issue reports are blocked until a valid site key and secret are added.
            </div>
          )}

          {reportStatus ? (
            <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${reportStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {reportStatus.message}
            </div>
          ) : null}

          <button type="submit" className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
            Report an issue
          </button>
        </form>
      </div>
    </div>
  );
}
