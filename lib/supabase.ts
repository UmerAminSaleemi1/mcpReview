import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { serverCatalog as demoServerCatalog, type ServerRecord } from '@/lib/demo-data';
import { isDemoModeEnabled, mapPublishedServers, type PublicServerRecord, type RawServerRow } from '@/lib/catalog';
import { type SearchState, type SearchSortKey } from '@/lib/search';

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

export async function getPublishedServersForQuery(
  state: SearchState,
): Promise<{ items: PublicServerRecord[]; error: string | null; totalCount: number; pageSize: number }> {
  const allServers = await getPublishedServers();

  if (allServers.error) {
    return { items: [], error: allServers.error, totalCount: 0, pageSize: 12 };
  }

  const normalizedQuery = state.query.trim().toLowerCase();
  const filtered = allServers.items.filter((server) => {
    const haystack = `${server.name} ${server.summary} ${server.category} ${server.tags.join(' ')} ${server.capabilities.join(' ')}`.toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesCategory = !state.category || server.categorySlug === state.category || server.category.toLowerCase() === state.category.toLowerCase();
    const matchesClient = !state.client || server.clients.some((client) => client.slug === state.client || client.label.toLowerCase() === state.client.toLowerCase());
    const matchesHosting = !state.hosting || server.hosting.toLowerCase() === state.hosting.toLowerCase();
    const matchesPricing = !state.pricing || server.pricing.toLowerCase() === state.pricing.toLowerCase();
    const matchesStatus = !state.status || server.status === state.status;

    return matchesQuery && matchesCategory && matchesClient && matchesHosting && matchesPricing && matchesStatus;
  });

  const sortKey: SearchSortKey = state.sort;
  const sorted = [...filtered].sort((left, right) => {
    if (sortKey === 'name') {
      return left.name.localeCompare(right.name);
    }
    if (sortKey === 'published_at') {
      return new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime();
    }
    if (sortKey === 'reviewed_at') {
      return new Date(right.reviewedAt ?? 0).getTime() - new Date(left.reviewedAt ?? 0).getTime();
    }

    if (left.name.toLowerCase() === normalizedQuery && right.name.toLowerCase() !== normalizedQuery) {
      return -1;
    }
    if (right.name.toLowerCase() === normalizedQuery && left.name.toLowerCase() !== normalizedQuery) {
      return 1;
    }

    const leftScore = `${left.name} ${left.summary}`.toLowerCase().includes(normalizedQuery) ? 2 : 1;
    const rightScore = `${right.name} ${right.summary}`.toLowerCase().includes(normalizedQuery) ? 2 : 1;
    return rightScore - leftScore || new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime();
  });

  const pageSize = 12;
  const safePage = Number.isFinite(state.page) && state.page > 0 && state.page <= 5000 ? state.page : 1;
  const startIndex = (safePage - 1) * pageSize;
  const items = sorted.slice(startIndex, startIndex + pageSize);

  return {
    items,
    error: null,
    totalCount: filtered.length,
    pageSize,
  };
}

export async function getPublishedServersForComparison(
  slugs: string[],
): Promise<{ items: PublicServerRecord[]; error: string | null }> {
  const { items, error } = await getPublishedServers();

  if (error) {
    return { items: [], error };
  }

  const selected = slugs
    .map((slug) => items.find((server) => server.slug === slug))
    .filter((server): server is PublicServerRecord => Boolean(server));

  return { items: selected.slice(0, 3), error: null };
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
