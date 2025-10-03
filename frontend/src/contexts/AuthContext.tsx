'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasCalendarPermission: boolean;
  calendarPermissionLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkCalendarPermission: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const [calendarPermissionLoading, setCalendarPermissionLoading] = useState(false);

  const checkCalendarPermission = useCallback(async (): Promise<boolean> => {
    if (!session) return false;
    
    setCalendarPermissionLoading(true);
    try {
      // Check if the session has the calendar scope by looking at the provider token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.provider_token) {
        setHasCalendarPermission(false);
        return false;
      }

      // For Google OAuth, we can check the scopes in the provider_token
      // or make a test API call to Google Calendar
      const token = currentSession.provider_token;
      
      // Make a simple test call to Google Calendar API to verify permissions
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const hasPermission = response.ok;
      setHasCalendarPermission(hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('Error checking calendar permission:', error);
      setHasCalendarPermission(false);
      return false;
    } finally {
      setCalendarPermissionLoading(false);
    }
  }, [supabase, session]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Check calendar permission if user has a session
      if (data.session) {
        await checkCalendarPermission();
      }
      
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check calendar permission when auth state changes
      if (newSession) {
        checkCalendarPermission();
      } else {
        setHasCalendarPermission(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => ({ 
    user, 
    session, 
    loading, 
    hasCalendarPermission, 
    calendarPermissionLoading, 
    signInWithGoogle, 
    signOut, 
    checkCalendarPermission 
  }), [user, session, loading, hasCalendarPermission, calendarPermissionLoading, signInWithGoogle, signOut, checkCalendarPermission]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
