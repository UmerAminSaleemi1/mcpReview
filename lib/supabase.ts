import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverCatalog, type ServerRecord } from '@/lib/demo-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_PUBLISHABLE_KEY &&
      !SUPABASE_URL.includes('your-project-id') &&
      !SUPABASE_PUBLISHABLE_KEY.includes('your-publishable-key')
  );
}

export function isLocalDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !isSupabaseConfigured();
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

export async function getPublishedServers(): Promise<ServerRecord[]> {
  if (isLocalDemoMode()) {
    return serverCatalog;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return serverCatalog;
  }

  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return serverCatalog;
  }

  return data.map((server) => ({
    slug: server.slug,
    name: server.name,
    summary: server.summary,
    category: server.category ?? 'General',
    clients: Array.isArray(server.clients) ? server.clients : [],
    verdict: server.verdict ?? 'Unknown',
    reviewed: server.published_at ?? server.created_at ?? 'Unknown',
    price: server.pricing ?? 'Unknown',
    hosting: server.hosting ?? 'Unknown',
    tags: Array.isArray(server.tags) ? server.tags : [],
    trustLabel: server.status === 'published' ? 'Reviewed' : 'Needs more evidence',
    demo: false,
    capabilities: Array.isArray(server.capabilities) ? server.capabilities : [],
    permissions: Array.isArray(server.permissions) ? server.permissions : [],
    setup: Array.isArray(server.setup) ? server.setup : [],
    refs: Array.isArray(server.references) ? server.references : ['Published from Supabase'],
  }));
}

export async function getPublishedServerBySlug(slug: string) {
  const servers = await getPublishedServers();
  return servers.find((server) => server.slug === slug) ?? null;
}
