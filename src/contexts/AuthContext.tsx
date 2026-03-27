import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signInWithCAS: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isLoading: true,
  });

  const loadUserData = async (user: User) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
    ]);

    return {
      profile: profileRes.data as Profile | null,
      roles: (rolesRes.data || []).map((r: { role: string }) => r.role as UserRole),
    };
  };

  useEffect(() => {
    // Set up auth listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const { profile, roles } = await loadUserData(session.user);
            setState({
              user: session.user,
              session,
              profile,
              roles,
              isLoading: false,
            });
          }, 0);
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isLoading: false,
          });
        }
      }
    );

    supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithCAS = () => {
    const casLoginUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cas-auth?redirect=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
    window.location.href = casLoginUrl;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signInWithCAS, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
