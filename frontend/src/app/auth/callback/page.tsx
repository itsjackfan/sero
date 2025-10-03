'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg">Signing you in…</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <p className="text-sm text-gray-500">Redirecting to login page...</p>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <p className="text-gray-700 text-lg">Authentication successful! Redirecting...</p>
      </div>
    </div>
  );
}

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const handleAuthCallback = async () => {
      try {
        const authError = searchParams.get('error_description');

        if (authError) {
          console.error('Auth callback error from provider:', authError);
          setError(authError);
          setStatus('error');
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setStatus('error');
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
          return;
        }

        if (!data.session) {
          console.error('No session found after auth callback');
          setError('Authentication failed. No session found.');
          setStatus('error');
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
          return;
        }

        console.log('Auth callback successful:', data.session.user);
        setStatus('success');
        router.replace('/home/dashboard');
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred during authentication.');
        setStatus('error');
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'error') {
    return <ErrorState message={error} />;
  }

  return <SuccessState />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackPageContent />
    </Suspense>
  );
}
