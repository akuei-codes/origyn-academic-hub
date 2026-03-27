import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

export default function StudentInvitations() {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['student-invitations', profile?.email],
    queryFn: () => api.getStudentInvitations(profile!.email),
    enabled: !!profile?.email,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.acceptInvitation(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      toast({ title: 'Invitation accepted', description: 'You are now enrolled in the course.' });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.declineInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
      toast({ title: 'Invitation declined' });
    },
  });

  return (
    <AppLayout>
      <PageHeader title="Invitations" description="Review and respond to course invitations" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="When a professor invites you to a course, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {invitations.map((inv: any) => (
            <Card key={inv.id} className="animate-fade-in">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">{inv.course_code}</p>
                    <p className="font-serif text-lg text-foreground">{inv.course_title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">From {inv.inviter_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => declineMutation.mutate(inv.id)} disabled={declineMutation.isPending} className="gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => acceptMutation.mutate(inv.id)} disabled={acceptMutation.isPending} className="gap-1.5">
                    {acceptMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
