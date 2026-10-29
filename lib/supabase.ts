import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { serverCatalog as demoServerCatalog, type ServerRecord } from '@/lib/demo-data';
import { isDemoModeEnabled, mapPublishedServers, type PublicServerRecord, type RawServerRow } from '@/lib/catalog';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export type { PublicServerRecord as ServerRecord } from '@/lib/catalog';

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_PUBLISHABLE_KEY &&
      !SUPABASE_URL.includes('your-project-id') &&
      !SUPABASE_PUBLISHABLE_KEY.includes('your-publishable-key')
  );
}

export function isLocalDemoMode() {
  return isDemoModeEnabled();
}

export function createBrowserSupabaseClient() {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
}

export async function createServerSupabaseClient() {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignore cookie writes during server-side fetches when they are not needed.
        }
      },
    },
  });
}

function mapDemoServerCatalog(): PublicServerRecord[] {
  return demoServerCatalog.map((server: ServerRecord) => ({
    id: server.slug,
    slug: server.slug,
    name: server.name,
    summary: server.summary,
    category: server.category,
    categorySlug: null,
    clients: server.clients.map((clientName) => ({
      label: clientName,
      slug: clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      claimedSupport: true,
      testedSupport: false,
    })),
    pricing: server.price,
    hosting: server.hosting,
    status: 'published',
    publishedAt: server.reviewed,
    reviewedAt: server.reviewed,
    tags: server.tags,
    capabilities: server.capabilities,
    permissions: server.permissions,
    setup: server.setup,
    refs: server.refs,
    demo: true,
  }));
}

export function getPublishedServersFromRows(
  rows: RawServerRow[] | null,
  queryError: { message?: string } | null = null,
): { items: PublicServerRecord[]; error: string | null } {
  if (queryError || !rows) {
    return {
      items: [],
      error: 'The directory is temporarily unavailable. Please try again later.',
    };
  }

  return {
    items: mapPublishedServers(rows),
    error: null,
  };
}

export async function getPublishedServers(): Promise<{ items: PublicServerRecord[]; error: string | null }> {
  if (isLocalDemoMode()) {
    return { items: mapDemoServerCatalog(), error: null };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      items: [],
      error: 'The directory is temporarily unavailable. Please try again later.',
    };
  }

  const { data, error } = await supabase
    .from('servers')
    .select(
      `
        id,
        slug,
        name,
        summary,
        category,
        hosting,
        pricing,
        status,
        published_at,
        verified_at,
        metadata,
        server_categories!server_id (
          categories!category_id (slug, label)
        ),
        server_client_support!server_id (
          claimed_support,
          tested_support,
          clients!client_id (slug, label)
        )
      `,
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  return getPublishedServersFromRows((data ?? []) as unknown as RawServerRow[], error);
}

export async function getPublishedServerBySlug(slug: string): Promise<{ item: PublicServerRecord | null; error: string | null }> {
  const { items, error } = await getPublishedServers();

  if (error) {
    return { item: null, error };
  }

  const item = items.find((server) => server.slug === slug) ?? null;
  return { item, error: null };
}

export async function getPublishedCategories(): Promise<{ items: Array<{ slug: string; label: string; description: string | null }>; error: string | null }> {
  if (isLocalDemoMode()) {
    return {
      items: [
        { slug: 'productivity', label: 'Productivity', description: 'Context and workstream orchestration.' },
        { slug: 'knowledge', label: 'Knowledge', description: 'Docs, wiki, and research tools.' },
        { slug: 'data', label: 'Data', description: 'Databases and analytics access.' },
        { slug: 'automation', label: 'Automation', description: 'Browser and workflow tooling.' },
      ],
      error: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { items: [], error: 'The directory is temporarily unavailable. Please try again later.' };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('slug, label, description')
    .order('label', { ascending: true });

  if (error) {
    return { items: [], error: 'The directory is temporarily unavailable. Please try again later.' };
  }

  return {
    items: (data ?? []).map((category) => ({
      slug: category.slug,
      label: category.label,
      description: category.description,
    })),
    error: null,
  };
}
