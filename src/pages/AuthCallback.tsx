import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { roles, isLoading } = useAuth();

  useEffect(() => {
    // Check if we have access_token and refresh_token in the URL hash (from CAS edge function redirect)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        return; // onAuthStateChange will handle redirect
      }
    }

    // Also check query params (alternative flow)
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      return;
    }

    // If no tokens, wait for auth state
    if (isLoading) return;

    if (roles.includes('professor')) {
      navigate('/professor', { replace: true });
    } else if (roles.includes('student')) {
      navigate('/student', { replace: true });
    } else if (roles.length > 0) {
      navigate('/student', { replace: true });
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, [roles, isLoading, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
