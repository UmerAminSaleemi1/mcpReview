import type { Database } from '@/types/supabase';
import { createServerSupabaseClient, isLocalDemoMode, isSupabaseConfigured } from '@/lib/supabase';

export type AppRole = Database['public']['Enums']['app_role'];

export type SessionProfile = {
  user: { id: string; email?: string | null } | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
  role: AppRole;
  isLoggedIn: boolean;
};

export function getEffectiveRole(role?: string | null): AppRole {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'editor':
      return 'editor';
    case 'developer':
      return 'developer';
    case 'member':
      return 'member';
    case 'visitor':
      return 'visitor';
    default:
      return 'visitor';
  }
}

export function canAccessAdmin(profileOrRole?: { role?: string | null } | null | string): boolean {
  const role = typeof profileOrRole === 'string' ? profileOrRole : profileOrRole?.role ?? null;
  return getEffectiveRole(role) === 'admin';
}

export function canManageEditors(profileOrRole?: { role?: string | null } | null | string): boolean {
  const role = typeof profileOrRole === 'string' ? profileOrRole : profileOrRole?.role ?? null;
  const effective = getEffectiveRole(role);
  return effective === 'editor' || effective === 'admin';
}

export async function getSessionProfile(): Promise<SessionProfile> {
  if (isLocalDemoMode() || !isSupabaseConfigured()) {
    return {
      user: null,
      profile: null,
      role: 'visitor',
      isLoggedIn: false,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      user: null,
      profile: null,
      role: 'visitor',
      isLoggedIn: false,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      profile: null,
      role: 'visitor',
      isLoggedIn: false,
    };
  }

  let profile = null as Database['public']['Tables']['profiles']['Row'] | null;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    profile = existingProfile;
  } else {
    const { data: insertedProfile } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email ?? '',
          full_name: user.user_metadata?.full_name ?? null,
          role: 'member',
        },
        { onConflict: 'id' },
      )
      .select()
      .maybeSingle();

    profile = insertedProfile ?? null;
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
    role: getEffectiveRole(profile?.role ?? 'member'),
    isLoggedIn: true,
  };
}
