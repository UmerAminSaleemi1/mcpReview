import { canManageEditors, type AppRole } from '@/lib/auth';
import { createServerSupabaseClient, isLocalDemoMode, isSupabaseConfigured } from '@/lib/supabase';

export type EditorialStatus =
  | 'draft'
  | 'in_review'
  | 'review'
  | 'published'
  | 'rejected'
  | 'archived'
  | 'unknown';

export function canManageEditorialContent(profileOrRole?: { role?: string | null } | null | string): boolean {
  return canManageEditors(profileOrRole);
}

export function getEditorialStatusLabel(status?: string | null): string {
  switch (status) {
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'review':
    case 'in_review':
      return 'In review';
    case 'rejected':
      return 'Rejected';
    case 'archived':
      return 'Archived';
    default:
      return 'Draft';
  }
}

type DashboardSummary = {
  totalServers: number;
  publishedServers: number;
  draftServers: number;
  pendingReviews: number;
  moderationQueue: number;
};

type DashboardServer = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  updated_at: string | null;
  published_at: string | null;
};

type DashboardReview = {
  id: string;
  summary: string;
  status: string | null;
  version: string | null;
  updated_at: string | null;
};

type DashboardSubmission = {
  id: string;
  server_name: string;
  status: string | null;
  created_at: string | null;
};

export async function getEditorialDashboardData(): Promise<{
  stats: DashboardSummary;
  servers: DashboardServer[];
  reviews: DashboardReview[];
  submissions: DashboardSubmission[];
  error: string | null;
}> {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return {
      stats: {
        totalServers: 0,
        publishedServers: 0,
        draftServers: 0,
        pendingReviews: 0,
        moderationQueue: 0,
      },
      servers: [],
      reviews: [],
      submissions: [],
      error: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      stats: {
        totalServers: 0,
        publishedServers: 0,
        draftServers: 0,
        pendingReviews: 0,
        moderationQueue: 0,
      },
      servers: [],
      reviews: [],
      submissions: [],
      error: 'The editorial dashboard is temporarily unavailable. Please try again later.',
    };
  }

  const [serversResult, reviewsResult, submissionsResult] = await Promise.all([
    supabase.from('servers').select('id, name, slug, status, updated_at, published_at').order('updated_at', { ascending: false }).limit(8),
    supabase.from('reviews').select('id, summary, status, version, updated_at').order('updated_at', { ascending: false }).limit(8),
    supabase.from('submissions').select('id, server_name, status, created_at').order('created_at', { ascending: false }).limit(8),
  ]);

  const servers = (serversResult.data ?? []) as DashboardServer[];
  const reviews = (reviewsResult.data ?? []) as DashboardReview[];
  const submissions = (submissionsResult.data ?? []) as DashboardSubmission[];

  const stats: DashboardSummary = {
    totalServers: servers.length,
    publishedServers: servers.filter((server) => server.status === 'published').length,
    draftServers: servers.filter((server) => server.status === 'draft').length,
    pendingReviews: reviews.filter((review) => review.status !== 'published').length,
    moderationQueue: submissions.filter((submission) => submission.status !== 'approved').length,
  };

  return {
    stats,
    servers,
    reviews,
    submissions,
    error: serversResult.error || reviewsResult.error || submissionsResult.error ? 'The editorial dashboard could not load some records. Please try again later.' : null,
  };
}

export type { AppRole };
