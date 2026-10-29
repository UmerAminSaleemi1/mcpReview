import assert from 'node:assert/strict';
import test from 'node:test';

import { getStorageValidationError, isSafeStorageUpload } from '../lib/storage';

test('public evidence and logos accept safe file types and reject active content', () => {
  assert.equal(getStorageValidationError('public-evidence', 'evidence.pdf', 'application/pdf'), null);
  assert.equal(getStorageValidationError('public-evidence', 'screenshot.png', 'image/png'), null);
  assert.equal(getStorageValidationError('public-logos', 'logo.webp', 'image/webp'), null);

  assert.equal(getStorageValidationError('public-evidence', 'dangerous.svg', 'image/svg+xml'), 'Unsafe file type for this bucket.');
  assert.equal(getStorageValidationError('public-evidence', 'payload.html', 'text/html'), 'Unsafe file type for this bucket.');
  assert.equal(getStorageValidationError('private-evidence', 'payload.exe', 'application/x-msdownload'), 'Unsafe file type for this bucket.');

  assert.equal(isSafeStorageUpload('public-evidence', 'evidence.pdf', 'application/pdf'), true);
  assert.equal(isSafeStorageUpload('public-evidence', 'payload.svg', 'image/svg+xml'), false);
  assert.equal(isSafeStorageUpload('private-evidence', 'notes.txt', 'text/plain'), true);
});
