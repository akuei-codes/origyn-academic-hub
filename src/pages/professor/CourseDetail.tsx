import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Mail, BookOpen, Plus, Send, CheckCircle2, Clock, X, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEMO_ASSIGNMENTS } from '@/lib/demo-data';
import { format } from 'date-fns';

const DEMO_STUDENTS = [
  { id: '1', name: 'Alex Chen', email: 'achen@princeton.edu', enrolledAt: '2026-01-15' },
  { id: '2', name: 'Maya Patel', email: 'mpatel@princeton.edu', enrolledAt: '2026-01-16' },
  { id: '3', name: 'James Wright', email: 'jwright@princeton.edu', enrolledAt: '2026-01-18' },
];

const DEMO_INVITATIONS = [
  { id: '1', email: 'slee@princeton.edu', status: 'pending' as const, sentAt: '2026-03-20' },
  { id: '2', email: 'rkim@princeton.edu', status: 'pending' as const, sentAt: '2026-03-22' },
  { id: '3', email: 'jdoe@princeton.edu', status: 'accepted' as const, sentAt: '2026-03-10' },
];

export default function CourseDetail() {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitations, setInvitations] = useState(DEMO_INVITATIONS);

  const course = { id: courseId, title: 'Advanced Expository Writing', code: 'WRI 305', term: 'Spring', year: 2026 };
  const assignments = DEMO_ASSIGNMENTS.filter((a) => a.course_id === 'course-1');

  const handleInvite = () => {
    if (!inviteEmail.endsWith('@princeton.edu')) {
      toast({ title: 'Invalid email', description: 'Only Princeton email addresses are allowed.', variant: 'destructive' });
      return;
    }
    setInvitations(prev => [...prev, { id: Date.now().toString(), email: inviteEmail, status: 'pending', sentAt: new Date().toISOString().split('T')[0] }]);
    toast({ title: 'Invitation sent', description: `Invited ${inviteEmail} to this course.` });
    setInviteEmail('');
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case 'pending': return <Clock className="h-3.5 w-3.5 text-warning" />;
      case 'declined': return <X className="h-3.5 w-3.5 text-destructive" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={course.title}
        description={`${course.code} · ${course.term} ${course.year}`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Enrolled Students" value={DEMO_STUDENTS.length} />
        <StatCard icon={Mail} label="Pending Invitations" value={invitations.filter(i => i.status === 'pending').length} />
        <StatCard icon={FileText} label="Assignments" value={assignments.length} />
      </div>

      <Tabs defaultValue="assignments" className="animate-fade-in">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        {/* Assignments tab */}
        <TabsContent value="assignments" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Link to={`/professor/courses/${courseId}/assignments/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Assignment
              </Button>
            </Link>
          </div>
          {assignments.length === 0 ? (
            <EmptyState icon={FileText} title="No assignments yet" description="Create your first writing assignment for this course." />
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <Card key={a.id} className="group transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-base font-medium text-foreground">{a.title}</h3>
                        <Badge variant={a.is_published ? 'default' : 'secondary'} className="text-xs">
                          {a.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                        {a.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {format(new Date(a.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {a.settings.time_limit_minutes && <span>{a.settings.time_limit_minutes} min</span>}
                      </div>
                    </div>
                    <Link to={`/professor/courses/${courseId}/assignments/${a.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground group-hover:text-foreground">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          {DEMO_STUDENTS.length === 0 ? (
            <EmptyState icon={Users} title="No enrolled students" description="Invite students to this course to get started." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_STUDENTS.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email}</TableCell>
                      <TableCell className="text-muted-foreground">{s.enrolledAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Invite a Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="student@princeton.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="max-w-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <Button onClick={handleInvite} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        <Badge variant={inv.status === 'accepted' ? 'default' : 'secondary'} className="text-xs capitalize">
                          {inv.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{inv.sentAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
