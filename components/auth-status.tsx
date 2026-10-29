'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase';

export function AuthStatus() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    const syncSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      setLoading(false);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  if (!email) {
    return (
      <Link href="/auth/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-600 sm:inline">{email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
      >
        Sign out
      </button>
    </div>
  );
}
