'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const run = async () => {
      // TODO: real check user auth aka debug Supabase
      router.replace('/dashboard');
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">Signing you in…</div>
  );
}
