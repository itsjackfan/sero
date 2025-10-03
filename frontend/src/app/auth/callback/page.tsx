'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash and code
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setStatus('error');
          // Redirect to login after a delay
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
        
        // Redirect to dashboard after successful authentication
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
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Signing you in…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <p className="text-gray-700 text-lg">Authentication successful! Redirecting...</p>
      </div>
    </div>
  );
}
