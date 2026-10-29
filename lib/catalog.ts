import type { Database } from '@/types/supabase';

export type PublicServerRecord = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: string;
  categorySlug: string | null;
  clients: Array<{
    label: string;
    slug: string;
    claimedSupport: boolean;
    testedSupport: boolean;
  }>;
  pricing: string;
  hosting: string;
  status: Database['public']['Tables']['servers']['Row']['status'] | 'unknown';
  publishedAt: string | null;
  reviewedAt: string | null;
  tags: string[];
  capabilities: string[];
  permissions: string[];
  setup: string[];
  refs: string[];
  demo: boolean;
};

type CatalogMetadata = {
  tags?: unknown;
  capabilities?: unknown;
  permissions?: unknown;
  setup?: unknown;
  references?: unknown;
};

type CatalogServerJoin = {
  server_categories?: Array<{
    categories?: {
      slug?: string | null;
      label?: string | null;
    } | null;
  } | null> | null;
  server_client_support?: Array<{
    claimed_support?: boolean | null;
    tested_support?: boolean | null;
    notes?: string | null;
    clients?: {
      slug?: string | null;
      label?: string | null;
    } | null;
  } | null> | null;
};

export type RawServerRow = Database['public']['Tables']['servers']['Row'] & {
  metadata?: Database['public']['Tables']['servers']['Row']['metadata'];
} & CatalogServerJoin;

export function isDemoModeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== 'production' && env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

export function normalizePublishedServerRow(row: RawServerRow): PublicServerRecord {
  const metadata = (row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? (row.metadata as CatalogMetadata)
    : {}) as CatalogMetadata;

  const categoryLabel = row.category?.trim() || 'General';
  const categorySlug =
    row.server_categories
      ?.map((entry) => entry?.categories?.slug ?? null)
      .find((slug): slug is string => typeof slug === 'string' && slug.length > 0) ?? null;

  const clients = (row.server_client_support ?? [])
    .map((entry) => {
      const clientLabel = entry?.clients?.label?.trim();
      const clientSlug = entry?.clients?.slug?.trim();

      if (!clientLabel && !clientSlug) {
        return null;
      }

      return {
        label: clientLabel || clientSlug || 'Unlabeled client',
        slug: clientSlug || clientLabel || 'unlabeled-client',
        claimedSupport: Boolean(entry?.claimed_support),
        testedSupport: Boolean(entry?.tested_support),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category: categoryLabel,
    categorySlug,
    clients,
    pricing: row.pricing?.trim() || 'Unknown',
    hosting: row.hosting?.trim() || 'Unknown',
    status: row.status ?? 'unknown',
    publishedAt: row.published_at ?? null,
    reviewedAt: row.verified_at ?? row.published_at ?? null,
    tags: getStringArray(metadata.tags),
    capabilities: getStringArray(metadata.capabilities),
    permissions: getStringArray(metadata.permissions),
    setup: getStringArray(metadata.setup),
    refs: getStringArray(metadata.references),
    demo: false,
  };
}

export function mapPublishedServers(rows: RawServerRow[]): PublicServerRecord[] {
  return rows.map((row) => normalizePublishedServerRow(row));
}
