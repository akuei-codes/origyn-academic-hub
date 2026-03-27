import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  courseTitle: string;
  code: string;
  invitedBy: string;
  sentAt: string;
}

const INITIAL_INVITATIONS: Invitation[] = [
  { id: '1', courseTitle: 'Creative Nonfiction Workshop', code: 'WRI 210', invitedBy: 'Prof. Marcus Lee', sentAt: '2026-03-22' },
  { id: '2', courseTitle: 'Essay & Argument', code: 'WRI 150', invitedBy: 'Dr. Sarah Kim', sentAt: '2026-03-25' },
];

export default function StudentInvitations() {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);

  const handleAccept = (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Invitation accepted', description: 'You are now enrolled in the course.' });
  };

  const handleDecline = (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Invitation declined' });
  };

  return (
    <AppLayout>
      <PageHeader title="Invitations" description="Review and respond to course invitations" />

      {invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="When a professor invites you to a course, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <Card key={inv.id} className="animate-fade-in">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">{inv.code}</p>
                    <p className="font-serif text-lg text-foreground">{inv.courseTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">From {inv.invitedBy} · Sent {inv.sentAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDecline(inv.id)} className="gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(inv.id)} className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
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
