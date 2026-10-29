import assert from 'node:assert/strict';
import test from 'node:test';

import { canAccessAdmin, canManageEditors, getEffectiveRole } from '../lib/auth';

test('visitor and member roles never gain editor or admin privileges by default', () => {
  assert.equal(getEffectiveRole(null), 'visitor');
  assert.equal(canManageEditors({ role: 'member' }), false);
  assert.equal(canAccessAdmin({ role: 'member' }), false);
  assert.equal(canManageEditors({ role: 'visitor' }), false);
  assert.equal(canAccessAdmin({ role: 'visitor' }), false);
});

test('admin and editor roles are the only roles allowed to manage editorial tools', () => {
  assert.equal(canManageEditors({ role: 'editor' }), true);
  assert.equal(canManageEditors({ role: 'admin' }), true);
  assert.equal(canAccessAdmin({ role: 'admin' }), true);
  assert.equal(canAccessAdmin({ role: 'editor' }), false);
});
