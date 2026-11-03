export const VALID_SORT_KEYS = ['relevance', 'name', 'published_at', 'reviewed_at'] as const;

export type SearchSortKey = (typeof VALID_SORT_KEYS)[number];

export type SearchState = {
  query: string;
  category: string;
  client: string;
  hosting: string;
  pricing: string;
  status: string;
  page: number;
  sort: SearchSortKey;
};

export function normalizeLikeQuery(value: string | null | undefined): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .replace(/['"`]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+(?=\S)/g, ' ')
    .trim();
}

export function getSearchStateFromUrl(
  params: Record<string, string | string[] | undefined>,
): SearchState {
  const rawQuery = normalizeLikeQuery(Array.isArray(params.query) ? params.query[0] : params.query ?? '');
  const rawCategory = normalizeLikeQuery(Array.isArray(params.category) ? params.category[0] : params.category ?? '');
  const rawClient = normalizeLikeQuery(Array.isArray(params.client) ? params.client[0] : params.client ?? '');
  const rawHosting = normalizeLikeQuery(Array.isArray(params.hosting) ? params.hosting[0] : params.hosting ?? '');
  const rawPricing = normalizeLikeQuery(Array.isArray(params.pricing) ? params.pricing[0] : params.pricing ?? '');
  const rawStatus = normalizeLikeQuery(Array.isArray(params.status) ? params.status[0] : params.status ?? '');
  const rawPage = Number(Array.isArray(params.page) ? params.page[0] : params.page ?? '1');
  const rawSort = normalizeLikeQuery(Array.isArray(params.sort) ? params.sort[0] : params.sort ?? 'relevance');

  const sort = VALID_SORT_KEYS.includes(rawSort as SearchSortKey)
    ? (rawSort as SearchSortKey)
    : 'relevance';

  const page = Number.isFinite(rawPage) && rawPage > 0 && rawPage <= 5000 ? Math.floor(rawPage) : 1;

  return {
    query: rawQuery,
    category: rawCategory,
    client: rawClient,
    hosting: rawHosting,
    pricing: rawPricing,
    status: rawStatus,
    page,
    sort,
  };
}

export function buildCompareIds(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values ?? []) {
    if (!value) {
      continue;
    }

    const cleaned = normalizeLikeQuery(value).replace(/\s+/g, '-');
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }

    seen.add(cleaned);
    result.push(cleaned);

    if (result.length >= 3) {
      break;
    }
  }

  return result;
}

export function buildSearchParams(state: Partial<SearchState>): URLSearchParams {
  const params = new URLSearchParams();
  const entries: Array<[string, string]> = [];

  if (state.query) entries.push(['query', state.query]);
  if (state.category) entries.push(['category', state.category]);
  if (state.client) entries.push(['client', state.client]);
  if (state.hosting) entries.push(['hosting', state.hosting]);
  if (state.pricing) entries.push(['pricing', state.pricing]);
  if (state.status) entries.push(['status', state.status]);
  if (state.page && state.page > 1) entries.push(['page', String(state.page)]);
  if (state.sort && state.sort !== 'relevance') entries.push(['sort', state.sort]);

  for (const [key, value] of entries) {
    params.set(key, value);
  }

  return params;
}
