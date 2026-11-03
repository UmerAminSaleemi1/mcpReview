import { createHash, randomUUID } from 'node:crypto';

export type EmailTemplateName = 'submission_ack' | 'submission_alert';

export type EmailDeliveryRecord = {
  id: string;
  template: EmailTemplateName;
  to: string;
  dedupeKey: string;
  subject: string;
  html: string;
  text: string;
  status: 'pending' | 'queued' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  nextAttemptAt: string | null;
  lastError: string | null;
};

export type EmailDeliveryStatus = {
  disabled: boolean;
  status: 'unconfigured' | 'pending' | 'queued' | 'failed' | 'skipped';
  message: string;
  record?: EmailDeliveryRecord;
};

export type JobProvider = {
  send: (payload: {
    to: string;
    subject: string;
    html: string;
    text: string;
    template: EmailTemplateName;
  }) => Promise<unknown>;
};

const EMAIL_OUTBOX = new Map<string, EmailDeliveryRecord>();
const MAX_EMAIL_ATTEMPTS = 3;
const EMAIL_RETRY_MS = 60_000;

function asIsoDate(date: Date): string {
  return date.toISOString();
}

function stableJson(value: Record<string, string>): string {
  return JSON.stringify(value, Object.keys(value).sort());
}

export function getEmailWorkerEnabled(): boolean {
  const enabled = process.env.EMAIL_WORKER_ENABLED?.trim().toLowerCase();
  return enabled === 'true' || enabled === '1';
}

export function buildEmailTemplate(
  template: EmailTemplateName,
  data: Record<string, string>,
): { subject: string; html: string; text: string } {
  const message = data.message ?? 'Your request was received.';

  switch (template) {
    case 'submission_ack':
      return {
        subject: 'Submission received',
        html: `<p>Thanks for submitting ${data.name ?? 'your MCP server'}.</p><p>${message}</p>`,
        text: `Thanks for submitting ${data.name ?? 'your MCP server'}.\n\n${message}`,
      };
    case 'submission_alert':
      return {
        subject: 'New moderation item',
        html: `<p>A new moderation item requires review.</p><p>${message}</p>`,
        text: `A new moderation item requires review.\n\n${message}`,
      };
    default:
      return {
        subject: 'Update',
        html: `<p>${message}</p>`,
        text: message,
      };
  }
}

export function createEmailDeliveryRecord({
  template,
  to,
  data,
}: {
  template: EmailTemplateName;
  to: string;
  data: Record<string, string>;
}): EmailDeliveryRecord {
  const normalizedTo = to.trim();
  const dedupePayload = stableJson(data);
  const dedupeKey = createHash('sha256')
    .update(`${template}:${normalizedTo.toLowerCase()}:${dedupePayload}`)
    .digest('hex');

  const existing = EMAIL_OUTBOX.get(dedupeKey);
  if (existing) {
    return { ...existing };
  }

  const rendered = buildEmailTemplate(template, data);
  const now = new Date();
  const record: EmailDeliveryRecord = {
    id: randomUUID(),
    template,
    to: normalizedTo,
    dedupeKey,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    status: 'pending',
    attempts: 0,
    maxAttempts: MAX_EMAIL_ATTEMPTS,
    createdAt: asIsoDate(now),
    updatedAt: asIsoDate(now),
    nextAttemptAt: asIsoDate(new Date(now.getTime() + EMAIL_RETRY_MS)),
    lastError: null,
  };

  EMAIL_OUTBOX.set(dedupeKey, record);
  return { ...record };
}

export function getEmailDeliveryStatus({
  apiKey,
  to,
  template,
}: {
  apiKey?: string | null;
  to?: string | null;
  template?: string | null;
}): EmailDeliveryStatus {
  if (!apiKey || !apiKey.trim()) {
    return {
      disabled: true,
      status: 'unconfigured',
      message: `Resend is not configured for ${template ?? 'email delivery'}; no message was sent.`,
    };
  }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return {
      disabled: true,
      status: 'failed',
      message: 'The recipient address is invalid, so the email was not sent.',
    };
  }

  if (!getEmailWorkerEnabled()) {
    return {
      disabled: true,
      status: 'pending',
      message: 'Email delivery is disabled until valid Resend configuration and the worker are available.',
    };
  }

  return {
    disabled: false,
    status: 'pending',
    message: 'Email delivery is configured and ready to send.',
  };
}

export async function processEmailDeliveryAttempt(
  record: EmailDeliveryRecord,
  provider?: JobProvider,
): Promise<EmailDeliveryRecord> {
  const inMemory = EMAIL_OUTBOX.get(record.dedupeKey) ?? record;
  const current = record.attempts >= inMemory.attempts ? record : inMemory;
  const nextAttempt = current.attempts + 1;
  const now = new Date();

  if (!provider && (!process.env.RESEND_API_KEY?.trim() || !getEmailWorkerEnabled())) {
    const fallback: EmailDeliveryRecord = {
      ...current,
      attempts: nextAttempt,
      status: nextAttempt >= current.maxAttempts ? 'failed' : 'pending',
      updatedAt: asIsoDate(now),
      nextAttemptAt: nextAttempt >= current.maxAttempts ? null : asIsoDate(new Date(now.getTime() + EMAIL_RETRY_MS * nextAttempt)),
      lastError: 'Email worker is disabled until valid Resend configuration is available.',
    };
    EMAIL_OUTBOX.set(current.dedupeKey, fallback);
    return { ...fallback };
  }

  const activeProvider = provider ?? {
    send: async ({ to, subject, html, text, template }) => {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const from = process.env.EMAIL_FROM ?? 'MCPlist <noreply@example.com>';

      await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
        text,
      });

      return { template, to, id: randomUUID() };
    },
  };

  try {
    await activeProvider.send({
      to: current.to,
      subject: current.subject,
      html: current.html,
      text: current.text,
      template: current.template,
    });

    const sent: EmailDeliveryRecord = {
      ...current,
      attempts: nextAttempt,
      status: 'queued',
      updatedAt: asIsoDate(now),
      nextAttemptAt: null,
      lastError: null,
    };

    EMAIL_OUTBOX.set(current.dedupeKey, sent);
    return { ...sent };
  } catch (error) {
    const next: EmailDeliveryRecord = {
      ...current,
      attempts: nextAttempt,
      status: nextAttempt >= current.maxAttempts ? 'failed' : 'pending',
      updatedAt: asIsoDate(now),
      nextAttemptAt: nextAttempt >= current.maxAttempts ? null : asIsoDate(new Date(now.getTime() + EMAIL_RETRY_MS * nextAttempt)),
      lastError: error instanceof Error ? error.message : 'Unknown email provider error.',
    };

    EMAIL_OUTBOX.set(current.dedupeKey, next);
    return { ...next };
  }
}

export async function sendTransactionalEmail({
  to,
  template,
  data,
  provider,
}: {
  to: string;
  template: EmailTemplateName;
  data: Record<string, string>;
  provider?: JobProvider;
}): Promise<EmailDeliveryStatus> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const record = createEmailDeliveryRecord({ template, to, data });

  if (!apiKey || !apiKey.trim()) {
    return {
      disabled: true,
      status: 'unconfigured',
      message: 'Email delivery is disabled until valid Resend configuration is available; the submission remains saved and the record stays pending.',
      record,
    };
  }

  if (!getEmailWorkerEnabled()) {
    return {
      disabled: true,
      status: 'pending',
      message: 'The email worker is disabled until valid configuration is available. The submission has been saved and the delivery record remains pending.',
      record,
    };
  }

  const next = await processEmailDeliveryAttempt(record, provider);
  const status = next.status === 'queued' ? 'queued' : next.status === 'failed' ? 'failed' : 'pending';

  return {
    disabled: status === 'failed' || status === 'pending',
    status,
    message:
      status === 'queued'
        ? `Email queued for ${to} using ${template}.`
        : status === 'failed'
          ? `Delivery failed after ${next.attempts} attempts: ${next.lastError ?? 'unknown provider error'}`
          : 'Delivery is pending while the provider is configured but not yet approved for live sends.',
    record: next,
  };
}
