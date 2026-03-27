import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { roles, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (roles.includes('professor')) {
      navigate('/professor', { replace: true });
    } else if (roles.includes('student')) {
      navigate('/student', { replace: true });
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, [roles, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
