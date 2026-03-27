import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ArrowRight, Shield } from 'lucide-react';

export default function SignIn() {
  const { signInWithCAS, setDemoRole, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoSignIn = (role: 'professor' | 'student') => {
    setDemoRole(role);
    navigate(role === 'professor' ? '/professor' : '/student');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Origyn</h1>
          <p className="mt-3 text-muted-foreground">
            High-trust academic writing, built for Princeton
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {!isDemo ? (
              <div className="space-y-4">
                <Button
                  onClick={signInWithCAS}
                  className="w-full gap-2 h-12 text-base"
                >
                  <Shield className="h-4 w-4" />
                  Sign in with Princeton CAS
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Authenticate securely through Princeton's Central Authentication Service
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg bg-accent/50 p-3 text-center">
                  <p className="text-sm text-accent-foreground">
                    Demo Mode — Supabase not configured
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real auth
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-center text-sm font-medium text-foreground">
                    Choose a demo role
                  </p>
                  <Button
                    onClick={() => handleDemoSignIn('professor')}
                    className="w-full gap-2 h-11"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Sign in as Professor
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDemoSignIn('student')}
                    variant="outline"
                    className="w-full gap-2 h-11"
                  >
                    Sign in as Student
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing in, you agree to Origyn's terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
