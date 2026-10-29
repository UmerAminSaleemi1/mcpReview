import assert from 'node:assert/strict';
import test from 'node:test';

import { saveEditorialDraftAction } from '../app/admin/actions';
import { validateEditorialDraft } from '../lib/editor';

test('editorial draft validation requires evidence and publication fields before save', () => {
  const result = validateEditorialDraft({
    name: 'Demo server',
    summary: 'Example summary',
    setup: '',
    permissions: '',
    reviewSummary: 'Example review',
    evidenceName: 'evidence.pdf',
    evidenceMime: 'application/pdf',
    evidenceVisibility: 'published',
    evidenceApproved: false,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('Setup instructions are required')));
  assert.ok(result.errors.some((message) => message.includes('Permissions or access notes are required')));
  assert.ok(result.errors.some((message) => message.includes('Public evidence requires explicit approval')));
});

test('editorial draft action rejects unprivileged callers before database writes', async () => {
  await assert.rejects(() => saveEditorialDraftAction(new FormData()), /Editor access required/i);
});
