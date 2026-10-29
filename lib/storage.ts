export type StorageBucketName = 'public-logos' | 'public-evidence' | 'private-evidence';

const ALLOWED_MIME_TYPES: Record<StorageBucketName, ReadonlySet<string>> = {
  'public-logos': new Set(['image/png', 'image/jpeg', 'image/webp']),
  'public-evidence': new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/json',
    'text/plain',
    'text/csv',
  ]),
  'private-evidence': new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/json',
    'text/plain',
    'text/csv',
    'application/zip',
  ]),
};

const BLOCKED_MIME_TYPES = new Set([
  'text/html',
  'application/html',
  'image/svg+xml',
  'application/javascript',
  'text/javascript',
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/x-msdos-program',
]);

const BLOCKED_EXTENSIONS = [
  '.svg',
  '.html',
  '.htm',
  '.exe',
  '.bat',
  '.cmd',
  '.ps1',
  '.sh',
  '.js',
  '.mjs',
  '.cjs',
  '.jar',
  '.scr',
];

function normalizeBucket(bucketId: string): StorageBucketName | null {
  const normalized = bucketId.trim().toLowerCase();
  if (normalized === 'public-logos' || normalized === 'public-evidence' || normalized === 'private-evidence') {
    return normalized;
  }

  return null;
}

function normalizeMimeType(mimeType: string | null | undefined): string {
  return (mimeType ?? '').trim().toLowerCase();
}

export function isSafeStorageUpload(bucketId: string, fileName: string, mimeType: string | null | undefined): boolean {
  const normalizedBucket = normalizeBucket(bucketId);
  if (!normalizedBucket) {
    return false;
  }

  const normalizedFileName = (fileName ?? '').trim().toLowerCase();
  const normalizedMimeType = normalizeMimeType(mimeType);

  if (!normalizedFileName) {
    return false;
  }

  if (BLOCKED_MIME_TYPES.has(normalizedMimeType)) {
    return false;
  }

  if (BLOCKED_EXTENSIONS.some((extension) => normalizedFileName.endsWith(extension))) {
    return false;
  }

  return ALLOWED_MIME_TYPES[normalizedBucket].has(normalizedMimeType);
}

export function getStorageValidationError(bucketId: string, fileName: string, mimeType: string | null | undefined): string | null {
  if (!isSafeStorageUpload(bucketId, fileName, mimeType)) {
    return 'Unsafe file type for this bucket.';
  }

  return null;
}
