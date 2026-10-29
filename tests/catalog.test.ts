import assert from 'node:assert/strict';
import test from 'node:test';

import { isDemoModeEnabled, mapPublishedServers, type RawServerRow } from '../lib/catalog';
import { getPublishedServers, getPublishedServersFromRows, isLocalDemoMode } from '../lib/supabase';

test('demo mode is only enabled in a non-production environment', () => {
  assert.equal(
    isDemoModeEnabled({ NODE_ENV: 'development', NEXT_PUBLIC_DEMO_MODE: 'true' } as NodeJS.ProcessEnv),
    true,
  );
  assert.equal(
    isDemoModeEnabled({ NODE_ENV: 'production', NEXT_PUBLIC_DEMO_MODE: 'true' } as NodeJS.ProcessEnv),
    false,
  );
  assert.equal(
    isDemoModeEnabled({ NODE_ENV: 'development', NEXT_PUBLIC_DEMO_MODE: 'false' } as NodeJS.ProcessEnv),
    false,
  );
});

test('explicit demo mode returns the demo catalog instead of pretending to be live data', async () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

  try {
    assert.equal(isLocalDemoMode(), true);
    const result = await getPublishedServers();
    assert.equal(result.error, null);
    assert.ok(result.items.length > 0);
    assert.equal(result.items[0]?.demo, true);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
  }
});

test('database failures remain explicit instead of silently falling back to a fake catalog', () => {
  const result = getPublishedServersFromRows(null, { message: 'Database unavailable' });

  assert.deepEqual(result, {
    items: [],
    error: 'The directory is temporarily unavailable. Please try again later.',
  });
});

test('database rows map without inventing claims or verdicts', () => {
  const rows = [
    {
      id: 'server-1',
      slug: 'example-server',
      name: 'Example Server',
      summary: 'A real database-backed listing.',
      category: 'Data',
      hosting: 'Hosted',
      pricing: 'Unknown',
      status: 'published',
      published_at: '2026-10-28T00:00:00.000Z',
      created_at: '2026-10-28T00:00:00.000Z',
      updated_at: '2026-10-28T00:00:00.000Z',
      verified_at: null,
      metadata: {
        tags: ['read-only', 'database'],
        capabilities: ['schema review'],
        permissions: ['read-only access'],
        setup: ['configure a role'],
        references: ['public docs'],
      },
      created_by: null,
      server_categories: [{ categories: { slug: 'data', label: 'Data' } }],
      server_client_support: [
        {
          claimed_support: true,
          tested_support: false,
          notes: null,
          clients: { slug: 'cursor', label: 'Cursor' },
        },
      ],
    } satisfies RawServerRow,
  ];

  const [server] = mapPublishedServers(rows);

  assert.equal(server.category, 'Data');
  assert.equal(server.categorySlug, 'data');
  assert.deepEqual(server.clients, [{ label: 'Cursor', slug: 'cursor', claimedSupport: true, testedSupport: false }]);
  assert.deepEqual(server.tags, ['read-only', 'database']);
  assert.deepEqual(server.capabilities, ['schema review']);
  assert.deepEqual(server.permissions, ['read-only access']);
  assert.deepEqual(server.setup, ['configure a role']);
  assert.deepEqual(server.refs, ['public docs']);
  assert.equal(server.status, 'published');
  assert.equal(server.demo, false);
});

test('empty result sets remain empty and do not fabricate placeholders', () => {
  assert.deepEqual(getPublishedServersFromRows([]), { items: [], error: null });
  assert.deepEqual(mapPublishedServers([]), []);
});
