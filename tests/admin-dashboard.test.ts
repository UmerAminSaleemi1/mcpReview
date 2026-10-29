import assert from 'node:assert/strict';
import test from 'node:test';

import { canManageEditorialContent, getEditorialStatusLabel } from '../lib/admin';

test('editorial dashboard access matches the editor/admin roles', () => {
  assert.equal(canManageEditorialContent({ role: 'editor' }), true);
  assert.equal(canManageEditorialContent({ role: 'admin' }), true);
  assert.equal(canManageEditorialContent({ role: 'member' }), false);
  assert.equal(canManageEditorialContent({ role: 'visitor' }), false);
});

test('status labels reflect the public editorial lifecycle', () => {
  assert.equal(getEditorialStatusLabel('published'), 'Published');
  assert.equal(getEditorialStatusLabel('draft'), 'Draft');
  assert.equal(getEditorialStatusLabel('archived'), 'Archived');
  assert.equal(getEditorialStatusLabel(undefined), 'Draft');
});
