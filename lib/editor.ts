import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { canManageEditors, getSessionProfile } from '@/lib/auth';
import { isSafeStorageUpload } from '@/lib/storage';
import { createServerSupabaseClient, isLocalDemoMode, isSupabaseConfigured } from '@/lib/supabase';

export type EditorialDraftInput = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  summary?: string | null;
  category?: string | null;
  hosting?: string | null;
  pricing?: string | null;
  permissions?: string | null;
  setup?: string | null;
  alternatives?: string | null;
  reviewSummary?: string | null;
  version?: string | null;
  notes?: string | null;
  evidenceName?: string | null;
  evidenceMime?: string | null;
  evidenceVisibility?: 'private' | 'published' | 'redacted' | null;
  evidenceApproved?: boolean | string | null;
  sourceMaterial?: string | null;
};

export type EditorialDraftRecord = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: string;
  hosting: string;
  pricing: string;
  permissions: string;
  setup: string;
  alternatives: string;
  reviewSummary: string;
  version: string;
  notes: string;
  status: string;
  updated_at: string | null;
  published_at: string | null;
};

export function slugify(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function sanitizeMarkdown(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .trim();
}

export function assertEditorAccess(profileOrRole?: { role?: string | null } | null | string): void {
  if (!canManageEditors(profileOrRole)) {
    throw new Error('Editor or admin access is required for this action.');
  }
}

export function validateEditorialDraft(input: EditorialDraftInput) {
  const errors: string[] = [];
  const name = (input.name ?? '').trim();
  const summary = (input.summary ?? '').trim();
  const category = (input.category ?? 'General').trim() || 'General';
  const hosting = (input.hosting ?? 'Unknown').trim() || 'Unknown';
  const pricing = (input.pricing ?? 'Unknown').trim() || 'Unknown';
  const setup = sanitizeMarkdown(input.setup ?? '');
  const permissions = sanitizeMarkdown(input.permissions ?? '');
  const alternatives = sanitizeMarkdown(input.alternatives ?? '');
  const version = (input.version ?? '1.0.0').trim() || '1.0.0';
  const reviewerSummary = sanitizeMarkdown(input.reviewSummary ?? summary) || summary;
  const notes = sanitizeMarkdown(input.notes ?? '');
  const rawSlug = slugify(input.slug ?? name) || 'untitled-server';

  if (!name) {
    errors.push('Listing name is required.');
  }

  if (!summary) {
    errors.push('Summary is required before saving a draft.');
  }

  if (!setup) {
    errors.push('Setup instructions are required before publication.');
  }

  if (!permissions) {
    errors.push('Permissions or access notes are required before publication.');
  }

  if (!reviewerSummary) {
    errors.push('Review summary is required.');
  }

  const evidenceName = (input.evidenceName ?? '').trim();
  const evidenceMime = (input.evidenceMime ?? '').trim();
  const evidenceVisibility = input.evidenceVisibility ?? 'private';
  const evidenceApproved = input.evidenceApproved === true || input.evidenceApproved === 'true';

  if (evidenceName && evidenceMime) {
    const bucket = evidenceVisibility === 'published' ? 'public-evidence' : 'private-evidence';
    if (!isSafeStorageUpload(bucket, evidenceName, evidenceMime)) {
      errors.push('Evidence files must be a safe type for the selected visibility level.');
    }
    if (evidenceVisibility === 'published' && !evidenceApproved) {
      errors.push('Public evidence requires explicit approval before publication.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: {
      name,
      slug: rawSlug,
      summary,
      category,
      hosting,
      pricing,
      permissions: permissions || 'Unknown',
      setup: setup || 'Unknown',
      alternatives: alternatives || 'Unknown',
      reviewSummary: reviewerSummary || summary,
      version,
      notes,
      evidenceVisibility,
      evidenceApproved,
    },
  };
}

export async function getEditorialDrafts(): Promise<EditorialDraftRecord[]> {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('servers')
    .select('id, slug, name, summary, category, hosting, pricing, status, published_at, updated_at, metadata')
    .order('updated_at', { ascending: false })
    .limit(30);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category: row.category,
    hosting: row.hosting,
    pricing: row.pricing,
    permissions: String((row.metadata as { permissions?: string } | null)?.permissions ?? 'Unknown'),
    setup: String((row.metadata as { setup?: string } | null)?.setup ?? 'Unknown'),
    alternatives: String((row.metadata as { alternatives?: string } | null)?.alternatives ?? 'Unknown'),
    reviewSummary: String((row.metadata as { reviewSummary?: string } | null)?.reviewSummary ?? row.summary),
    version: String((row.metadata as { version?: string } | null)?.version ?? '1.0.0'),
    notes: String((row.metadata as { notes?: string } | null)?.notes ?? ''),
    status: row.status,
    updated_at: row.updated_at,
    published_at: row.published_at,
  }));
}

export async function getEditorialPreview(serverId: string): Promise<EditorialDraftRecord | null> {
  if (!serverId) {
    return null;
  }

  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from('servers')
    .select('id, slug, name, summary, category, hosting, pricing, status, published_at, updated_at, metadata')
    .eq('id', serverId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    summary: data.summary,
    category: data.category,
    hosting: data.hosting,
    pricing: data.pricing,
    permissions: String((data.metadata as { permissions?: string } | null)?.permissions ?? 'Unknown'),
    setup: String((data.metadata as { setup?: string } | null)?.setup ?? 'Unknown'),
    alternatives: String((data.metadata as { alternatives?: string } | null)?.alternatives ?? 'Unknown'),
    reviewSummary: String((data.metadata as { reviewSummary?: string } | null)?.reviewSummary ?? data.summary),
    version: String((data.metadata as { version?: string } | null)?.version ?? '1.0.0'),
    notes: String((data.metadata as { notes?: string } | null)?.notes ?? ''),
    status: data.status,
    updated_at: data.updated_at,
    published_at: data.published_at,
  };
}

export async function getAuditTrail(serverId: string) {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('audit_events')
    .select('id, action, details, created_at')
    .eq('entity_id', serverId)
    .order('created_at', { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getServerRedirectTarget(slug: string): Promise<string | null> {
  if (!slug) {
    return null;
  }

  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from('slug_redirects').select('target_slug').eq('slug', slug).maybeSingle();
  return data?.target_slug ?? null;
}

export async function saveEditorialDraft(input: EditorialDraftInput) {
  const { isLoggedIn, role } = await getSessionProfile();
  if (!isLoggedIn || !canManageEditors({ role })) {
    throw new Error('Editor access required to save a draft.');
  }

  const validation = validateEditorialDraft(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const { normalized } = validation;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Editorial tools are temporarily unavailable.');
  }

  const existingBySlug = await supabase.from('servers').select('id').eq('slug', normalized.slug).maybeSingle();
  if (existingBySlug.data && existingBySlug.data.id !== input.id) {
    throw new Error('A listing already exists for this slug. Choose a different slug or edit the existing record.');
  }

  const payload = {
    id: input.id ?? undefined,
    slug: normalized.slug,
    name: normalized.name,
    summary: normalized.summary,
    category: normalized.category,
    hosting: normalized.hosting,
    pricing: normalized.pricing,
    status: 'draft',
    created_by: (await getSessionProfile()).user?.id ?? null,
    metadata: {
      permissions: normalized.permissions,
      setup: normalized.setup,
      alternatives: normalized.alternatives,
      reviewSummary: normalized.reviewSummary,
      version: normalized.version,
      notes: normalized.notes,
      evidenceVisibility: normalized.evidenceVisibility,
      evidenceApproved: normalized.evidenceApproved,
    },
  };

  const { data: server, error: serverError } = await supabase.from('servers').upsert(payload, { onConflict: 'id' }).select().single();
  if (serverError || !server) {
    throw new Error(serverError?.message ?? 'Draft save failed.');
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('server_id', server.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const reviewPayload = {
    id: existingReview?.id ?? undefined,
    server_id: server.id,
    version: normalized.version,
    status: 'draft',
    editor_id: (await getSessionProfile()).user?.id ?? null,
    summary: normalized.reviewSummary,
    publisher_claims: { pricing: normalized.pricing, hosting: normalized.hosting, permissions: normalized.permissions },
    verified_outcomes: {
      status: 'unknown',
      notes: normalized.notes || 'No verified outcomes recorded yet.',
    },
    source_material: normalized.setup ? [{ kind: 'setup-guide', text: normalized.setup }] : [],
  };

  const { error: reviewError } = await supabase.from('reviews').upsert(reviewPayload, { onConflict: 'id' }).select();
  if (reviewError) {
    throw new Error(reviewError.message ?? 'Review draft update failed.');
  }

  if (input.evidenceName && input.evidenceMime) {
    const visibility = normalized.evidenceVisibility === 'published' ? 'published' : 'private';
    const { error: evidenceError } = await supabase.from('evidence_files').insert({
      server_id: server.id,
      review_id: existingReview?.id ?? null,
      file_name: input.evidenceName,
      storage_path: `drafts/${server.id}/${Date.now()}-${input.evidenceName}`,
      mime_type: input.evidenceMime,
      visibility,
      created_by: (await getSessionProfile()).user?.id ?? null,
    });
    if (evidenceError) {
      throw new Error(evidenceError.message ?? 'Evidence metadata could not be saved.');
    }
  }

  await supabase.from('audit_events').insert({
    actor_id: (await getSessionProfile()).user?.id ?? null,
    entity_type: 'server',
    entity_id: server.id,
    action: 'draft_saved',
    details: { slug: normalized.slug, status: 'draft', version: normalized.version },
  });

  revalidatePath('/admin');
  revalidatePath('/servers');
  revalidatePath('/');

  return server;
}

export async function publishEditorialDraft(serverId: string, input: EditorialDraftInput) {
  const session = await getSessionProfile();
  assertEditorAccess(session);

  const validation = validateEditorialDraft(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const normalized = validation.normalized;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Editorial tools are temporarily unavailable.');
  }

  const { data: currentServer } = await supabase.from('servers').select('id, slug, status, published_at').eq('id', serverId).maybeSingle();
  if (!currentServer) {
    throw new Error('Target listing does not exist.');
  }

  const evidenceQuery = await supabase
    .from('evidence_files')
    .select('id, visibility')
    .eq('server_id', serverId)
    .in('visibility', ['published', 'private']);

  const hasApprovedPublicEvidence = (evidenceQuery.data ?? []).some((item) => item.visibility === 'published');
  if (!hasApprovedPublicEvidence && normalized.evidenceApproved) {
    // permitted: explicit approval is recorded when evidence is approved in the draft form
  }

  if (!normalized.evidenceApproved && !hasApprovedPublicEvidence) {
    throw new Error('Publication requires explicit evidence approval.');
  }

  const oldSlug = currentServer.slug;
  const nextSlug = normalized.slug;
  const now = new Date().toISOString();

  const { error: serverError } = await supabase
    .from('servers')
    .update({
      slug: nextSlug,
      name: normalized.name,
      summary: normalized.summary,
      category: normalized.category,
      hosting: normalized.hosting,
      pricing: normalized.pricing,
      status: 'published',
      published_at: now,
      verified_at: now,
      metadata: {
        permissions: normalized.permissions,
        setup: normalized.setup,
        alternatives: normalized.alternatives,
        reviewSummary: normalized.reviewSummary,
        version: normalized.version,
        notes: normalized.notes,
        evidenceVisibility: normalized.evidenceVisibility,
        evidenceApproved: normalized.evidenceApproved,
      },
    })
    .eq('id', serverId);

  if (serverError) {
    throw new Error(serverError.message ?? 'Publishing failed.');
  }

  const { data: review } = await supabase.from('reviews').select('id').eq('server_id', serverId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (review) {
    await supabase.from('reviews').update({
      summary: normalized.reviewSummary,
      version: normalized.version,
      status: 'published',
      checked_at: now,
      tested_at: now,
      editor_id: session.user?.id ?? null,
      publisher_claims: { pricing: normalized.pricing, hosting: normalized.hosting, permissions: normalized.permissions },
      verified_outcomes: { status: 'reviewed', notes: normalized.notes || 'Reviewed in editor workflow.' },
      source_material: [{ kind: 'setup-guide', text: normalized.setup }],
    }).eq('id', review.id);
  }

  if (oldSlug !== nextSlug) {
    await supabase.from('slug_redirects').upsert({
      slug: oldSlug,
      target_slug: nextSlug,
      server_id: serverId,
    }, { onConflict: 'slug' });
  }

  await supabase.from('audit_events').insert({
    actor_id: session.user?.id ?? null,
    entity_type: 'server',
    entity_id: serverId,
    action: 'published',
    details: { from_slug: oldSlug, to_slug: nextSlug, version: normalized.version },
  });

  revalidatePath('/admin');
  revalidatePath('/servers');
  revalidatePath('/');

  redirect(`/servers/${nextSlug}`);
}

export async function unpublishEditorialDraft(serverId: string) {
  const session = await getSessionProfile();
  assertEditorAccess(session);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Editorial tools are temporarily unavailable.');
  }

  const { error } = await supabase
    .from('servers')
    .update({
      status: 'draft',
      published_at: null,
      verified_at: null,
    })
    .eq('id', serverId);

  if (error) {
    throw new Error(error.message ?? 'Unpublish failed.');
  }

  await supabase.from('audit_events').insert({
    actor_id: session.user?.id ?? null,
    entity_type: 'server',
    entity_id: serverId,
    action: 'unpublished',
    details: { status: 'draft' },
  });

  revalidatePath('/admin');
  revalidatePath('/servers');
  revalidatePath('/');

  redirect('/admin');
}

export async function createTestRun(serverId: string, input: { name: string; environment?: string; scenarioVersion?: string; status?: string; notes?: string }) {
  const session = await getSessionProfile();
  assertEditorAccess(session);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Editorial tools are temporarily unavailable.');
  }

  const { data: review } = await supabase.from('reviews').select('id').eq('server_id', serverId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (!review) {
    throw new Error('Create a review record before adding test runs.');
  }

  const { error } = await supabase.from('test_runs').insert({
    review_id: review.id,
    name: input.name,
    environment: input.environment ?? 'manual',
    scenario_version: input.scenarioVersion ?? 'manual-1',
    status: (input.status as 'not_tested' | 'unknown' | 'passed' | 'failed' | 'partial') ?? 'unknown',
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(error.message ?? 'Test run could not be created.');
  }

  revalidatePath('/admin');
  return true;
}

export async function createTestResult(testRunId: string, input: { metricName: string; metricValue?: string; result?: string; notes?: string; score?: number | null }) {
  const session = await getSessionProfile();
  assertEditorAccess(session);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Editorial tools are temporarily unavailable.');
  }

  const { error } = await supabase.from('test_results').insert({
    test_run_id: testRunId,
    metric_name: input.metricName,
    metric_value: input.metricValue ?? null,
    result: (input.result as 'not_tested' | 'unknown' | 'passed' | 'failed' | 'partial') ?? 'unknown',
    notes: input.notes ?? null,
    score: input.score ?? null,
  });

  if (error) {
    throw new Error(error.message ?? 'Test result could not be saved.');
  }

  revalidatePath('/admin');
  return true;
}

export async function getReviewHistory(serverId: string) {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('review_revisions')
    .select('id, summary, revision_number, created_at, changes')
    .eq('review_id', (
      await supabase.from('reviews').select('id').eq('server_id', serverId).order('updated_at', { ascending: false }).limit(1).maybeSingle()
    ).data?.id ?? '00000000-0000-0000-0000-000000000000')
    .order('revision_number', { ascending: false })
    .limit(10);

  return data ?? [];
}
