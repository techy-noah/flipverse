'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (supabase as { auth: { getSession: () => Promise<{ data: { session: Session | null } }> } }).auth.getSession()
      .then((result) => {
        if (mounted) {
          const sess = result.data?.session ?? null;
          setSession(sess);
          setUser(sess?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data } = (supabase as { auth: { onAuthStateChange: (cb: (event: string, session: Session | null) => void) => { data: { subscription: { unsubscribe: () => void } } } } }).auth.onAuthStateChange((_event: string, sess: Session | null) => {
      if (mounted) {
        const currentSession = sess ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
