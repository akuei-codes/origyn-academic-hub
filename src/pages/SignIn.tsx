import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ArrowRight, Shield } from 'lucide-react';

export default function SignIn() {
  const { signInWithCAS } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
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
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing in, you agree to Origyn's terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
