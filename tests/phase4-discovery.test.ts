import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCompareIds,
  getSearchStateFromUrl,
  normalizeLikeQuery,
  VALID_SORT_KEYS,
} from '../lib/search';
import {
  createEmailDeliveryRecord,
  getEmailDeliveryStatus,
  processEmailDeliveryAttempt,
  type EmailDeliveryRecord,
} from '../lib/email';

test('search state keeps valid values and rejects invalid sort keys', () => {
  const next = getSearchStateFromUrl({
    query: 'veridian',
    category: 'productivity',
    client: 'claude',
    hosting: 'self-hosted',
    pricing: 'free',
    status: 'published',
    page: '2',
    sort: 'relevance',
  });

  assert.equal(next.query, 'veridian');
  assert.equal(next.category, 'productivity');
  assert.equal(next.page, 2);
  assert.equal(next.sort, 'relevance');
  assert.deepEqual(VALID_SORT_KEYS, ['relevance', 'name', 'published_at', 'reviewed_at']);

  const rejected = getSearchStateFromUrl({
    sort: 'bogus',
    page: '999999',
  });

  assert.equal(rejected.sort, 'relevance');
  assert.equal(rejected.page, 1);
});

test('search queries normalize empty and unsafe input', () => {
  assert.equal(normalizeLikeQuery('   '), '');
  assert.equal(normalizeLikeQuery('  "veridian"  '), 'veridian');
  assert.equal(normalizeLikeQuery('  foo  bar  '), 'foo bar');
});

test('comparison selector accepts up to three valid ids and ignores duplicates', () => {
  const ids = buildCompareIds(['veridian', 'veridian', 'claude', 'cursor', 'noop']);
  assert.deepEqual(ids, ['veridian', 'claude', 'cursor']);
});

test('email delivery reports a safe disabled state when Resend is not configured', () => {
  const result = getEmailDeliveryStatus({ apiKey: '', to: 'test@example.com', template: 'submission_ack' });

  assert.equal(result.disabled, true);
  assert.match(result.message, /not configured|disabled/i);
});

test('email delivery records deduplicate and stay pending while the worker is disabled', () => {
  const first = createEmailDeliveryRecord({
    template: 'submission_ack',
    to: 'owner@example.com',
    data: { name: 'Veridian MCP', message: 'Thanks for submitting.' },
  });
  const second = createEmailDeliveryRecord({
    template: 'submission_ack',
    to: 'owner@example.com',
    data: { name: 'Veridian MCP', message: 'Thanks for submitting.' },
  });

  assert.equal(first.dedupeKey, second.dedupeKey);
  assert.equal(first.status, 'pending');
  assert.equal(second.status, 'pending');
  assert.equal(first.attempts, 0);
});

test('provider failures retry until the bounded limit and preserve the delivery record', async () => {
  const record = createEmailDeliveryRecord({
    template: 'submission_alert',
    to: 'editor@example.com',
    data: { message: 'Moderation required.' },
  });

  let attempts = 0;
  const result = await processEmailDeliveryAttempt(record, {
    async send() {
      attempts += 1;
      throw new Error('temporary provider outage');
    },
  });

  assert.equal(result.status, 'pending');
  assert.equal(result.attempts, 1);
  assert.equal(result.nextAttemptAt !== null, true);
  assert.equal(attempts, 1);

  const finalResult = await processEmailDeliveryAttempt(result, {
    async send() {
      attempts += 1;
      throw new Error('temporary provider outage');
    },
  });

  assert.equal(finalResult.status, 'pending');
  assert.equal(finalResult.attempts, 2);

  const exhausted = await processEmailDeliveryAttempt({ ...finalResult, attempts: 3, maxAttempts: 3 }, {
    async send() {
      attempts += 1;
      throw new Error('temporary provider outage');
    },
  });

  assert.equal(exhausted.status, 'failed');
  assert.equal(exhausted.attempts, 4);
});
