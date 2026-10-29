'use server';

import { redirect } from 'next/navigation';

import { isSafeStorageUpload } from '@/lib/storage';
import { canManageEditors, getSessionProfile } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { publishEditorialDraft, saveEditorialDraft, unpublishEditorialDraft } from '@/lib/editor';

export async function saveEditorialDraftAction(formData: FormData) {
  const session = await getSessionProfile();
  if (!session.isLoggedIn || !canManageEditors({ role: session.role })) {
    throw new Error('Editor access required to save a draft.');
  }

  const input = {
    id: formData.get('id')?.toString() ?? null,
    name: formData.get('name')?.toString() ?? null,
    slug: formData.get('slug')?.toString() ?? null,
    summary: formData.get('summary')?.toString() ?? null,
    category: formData.get('category')?.toString() ?? null,
    hosting: formData.get('hosting')?.toString() ?? null,
    pricing: formData.get('pricing')?.toString() ?? null,
    permissions: formData.get('permissions')?.toString() ?? null,
    setup: formData.get('setup')?.toString() ?? null,
    alternatives: formData.get('alternatives')?.toString() ?? null,
    reviewSummary: formData.get('reviewSummary')?.toString() ?? null,
    version: formData.get('version')?.toString() ?? null,
    notes: formData.get('notes')?.toString() ?? null,
    evidenceName: formData.get('evidenceName')?.toString() ?? null,
    evidenceMime: formData.get('evidenceMime')?.toString() ?? null,
    evidenceVisibility: (formData.get('evidenceVisibility')?.toString() as 'private' | 'published' | 'redacted' | null) ?? null,
    evidenceApproved: formData.get('evidenceApproved') === 'true' ? true : false,
  };

  await saveEditorialDraft(input);
  redirect('/admin');
}

export async function publishEditorialDraftAction(formData: FormData) {
  const session = await getSessionProfile();
  if (!session.isLoggedIn || !canManageEditors({ role: session.role })) {
    throw new Error('Editor access required to publish a listing.');
  }

  const id = formData.get('id')?.toString();
  if (!id) {
    throw new Error('A listing id is required to publish.');
  }

  await publishEditorialDraft(id, {
    id,
    name: formData.get('name')?.toString() ?? null,
    slug: formData.get('slug')?.toString() ?? null,
    summary: formData.get('summary')?.toString() ?? null,
    category: formData.get('category')?.toString() ?? null,
    hosting: formData.get('hosting')?.toString() ?? null,
    pricing: formData.get('pricing')?.toString() ?? null,
    permissions: formData.get('permissions')?.toString() ?? null,
    setup: formData.get('setup')?.toString() ?? null,
    alternatives: formData.get('alternatives')?.toString() ?? null,
    reviewSummary: formData.get('reviewSummary')?.toString() ?? null,
    version: formData.get('version')?.toString() ?? null,
    notes: formData.get('notes')?.toString() ?? null,
    evidenceName: formData.get('evidenceName')?.toString() ?? null,
    evidenceMime: formData.get('evidenceMime')?.toString() ?? null,
    evidenceVisibility: (formData.get('evidenceVisibility')?.toString() as 'private' | 'published' | 'redacted' | null) ?? null,
    evidenceApproved: formData.get('evidenceApproved') === 'true' ? true : false,
  });

  redirect('/admin');
}

export async function unpublishEditorialDraftAction(formData: FormData) {
  const session = await getSessionProfile();
  if (!session.isLoggedIn || !canManageEditors({ role: session.role })) {
    throw new Error('Editor access required to unpublish a listing.');
  }

  const id = formData.get('id')?.toString();
  if (!id) {
    throw new Error('A listing id is required to unpublish.');
  }

  await unpublishEditorialDraft(id);
  redirect('/admin');
}

export async function saveManualEvidenceAction(formData: FormData) {
  const session = await getSessionProfile();
  if (!session.isLoggedIn || !canManageEditors({ role: session.role })) {
    throw new Error('Editor access required to save manual evidence.');
  }

  const serverId = formData.get('serverId')?.toString();
  if (!serverId) {
    throw new Error('A listing is required before saving manual evidence.');
  }

  const evidenceName = formData.get('evidenceName')?.toString()?.trim() ?? '';
  const evidenceMime = formData.get('evidenceMime')?.toString()?.trim() ?? '';
  const evidenceVisibility = (formData.get('evidenceVisibility')?.toString() as 'private' | 'published' | 'redacted' | null) ?? 'private';
  const bucket = evidenceVisibility === 'published' ? 'public-evidence' : 'private-evidence';

  if (!evidenceName || !evidenceMime || !isSafeStorageUpload(bucket, evidenceName, evidenceMime)) {
    throw new Error('Evidence must match the selected privacy bucket and safe file rules.');
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error('Evidence tools are temporarily unavailable.');
  }

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('server_id', serverId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!review) {
    throw new Error('Create a review before adding manual evidence.');
  }

  const testName = formData.get('testName')?.toString()?.trim() || 'Manual review evidence';
  const environment = formData.get('environment')?.toString()?.trim() || 'manual';
  const scenarioVersion = formData.get('scenarioVersion')?.toString()?.trim() || 'manual-1';
  const status = (formData.get('status')?.toString() as 'not_tested' | 'unknown' | 'passed' | 'failed' | 'partial' | null) ?? 'unknown';
  const notes = formData.get('notes')?.toString() ?? null;
  const metricName = formData.get('metricName')?.toString()?.trim() || 'manual-check';
  const metricValue = formData.get('metricValue')?.toString()?.trim() || null;
  const metricResult = (formData.get('metricResult')?.toString() as 'not_tested' | 'unknown' | 'passed' | 'failed' | 'partial' | null) ?? 'unknown';
  const scoreValue = Number(formData.get('score')?.toString() ?? '') || null;

  const { data: testRun, error: runError } = await supabase
    .from('test_runs')
    .insert({
      review_id: review.id,
      name: testName,
      environment,
      scenario_version: scenarioVersion,
      status,
      notes,
    })
    .select()
    .single();

  if (runError || !testRun) {
    throw new Error(runError?.message ?? 'Manual evidence could not be recorded.');
  }

  const { error: resultError } = await supabase.from('test_results').insert({
    test_run_id: testRun.id,
    metric_name: metricName,
    metric_value: metricValue,
    result: metricResult,
    notes: notes ?? null,
    score: scoreValue,
  });

  if (resultError) {
    throw new Error(resultError.message ?? 'Manual evidence results could not be stored.');
  }

  const { error: evidenceError } = await supabase.from('evidence_files').insert({
    server_id: serverId,
    review_id: review.id,
    file_name: evidenceName,
    storage_path: `manual-evidence/${serverId}/${Date.now()}-${evidenceName}`,
    mime_type: evidenceMime,
    visibility: evidenceVisibility,
    created_by: session.user?.id ?? null,
  });

  if (evidenceError) {
    throw new Error(evidenceError.message ?? 'Evidence metadata could not be saved.');
  }

  redirect('/admin');
}
