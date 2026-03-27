import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isDemo: boolean;
}

interface AuthContextType extends AuthState {
  signInWithCAS: () => Promise<void>;
  signOut: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo data for when Supabase is not configured
const DEMO_PROFESSOR_PROFILE: Profile = {
  id: 'demo-prof-1',
  email: 'professor@princeton.edu',
  full_name: 'Dr. Eleanor Vance',
  net_id: 'evance',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_STUDENT_PROFILE: Profile = {
  id: 'demo-student-1',
  email: 'student@princeton.edu',
  full_name: 'Alex Chen',
  net_id: 'achen',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isLoading: true,
    isDemo: !isSupabaseConfigured(),
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false, isDemo: true }));
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Fetch profile and roles
          const [profileRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', session.user.id).single(),
            supabase.from('user_roles').select('role').eq('user_id', session.user.id),
          ]);

          setState({
            user: session.user,
            session,
            profile: profileRes.data as Profile | null,
            roles: (rolesRes.data || []).map((r: { role: UserRole }) => r.role),
            isLoading: false,
            isDemo: false,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            roles: [],
            isLoading: false,
            isDemo: false,
          });
        }
      }
    );

    supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithCAS = async () => {
    if (state.isDemo) return;
    // In production, this would redirect to Princeton CAS
    // which then redirects back to a Supabase Edge Function
    // that validates the CAS ticket and creates a session
    const casLoginUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cas-auth?redirect=${window.location.origin}/auth/callback`;
    window.location.href = casLoginUrl;
  };

  const signOut = async () => {
    if (state.isDemo) {
      setState(prev => ({ ...prev, profile: null, roles: [], user: null, session: null }));
      return;
    }
    await supabase.auth.signOut();
  };

  const setDemoRole = (role: UserRole) => {
    const profile = role === 'professor' ? DEMO_PROFESSOR_PROFILE : DEMO_STUDENT_PROFILE;
    setState(prev => ({
      ...prev,
      profile,
      roles: [role],
      user: { id: profile.id, email: profile.email } as User,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signInWithCAS, signOut, setDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
