import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Mail, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const DEMO_ENROLLED = [
  { id: '1', title: 'Advanced Expository Writing', code: 'WRI 305', term: 'Spring', year: 2026, instructor: 'Dr. Eleanor Vance' },
];

const DEMO_INVITATIONS = [
  { id: '1', courseTitle: 'Creative Nonfiction Workshop', code: 'WRI 210', invitedBy: 'Prof. Marcus Lee', sentAt: '2026-03-22' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Student'}`}
        description="Your academic writing dashboard"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={DEMO_ENROLLED.length} />
        <StatCard icon={Mail} label="Pending Invitations" value={DEMO_INVITATIONS.length} />
        <StatCard icon={FileText} label="Assignments Due" value={0} />
      </div>

      {/* Pending invitations */}
      {DEMO_INVITATIONS.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-serif text-2xl text-foreground">Pending Invitations</h2>
          <div className="space-y-3">
            {DEMO_INVITATIONS.map((inv) => (
              <Card key={inv.id} className="group cursor-pointer transition-shadow hover:shadow-md animate-fade-in" onClick={() => navigate('/student/invitations')}>
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">{inv.code}</p>
                        <Badge className="text-xs">New</Badge>
                      </div>
                      <p className="font-serif text-lg text-foreground">{inv.courseTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">From {inv.invitedBy}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled courses */}
      <div>
        <h2 className="mb-4 font-serif text-2xl text-foreground">Your Courses</h2>
        {DEMO_ENROLLED.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Accept an invitation from a professor to join a course."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {DEMO_ENROLLED.map((course) => (
              <Card key={course.id} className="group cursor-pointer transition-shadow hover:shadow-md animate-fade-in" onClick={() => navigate(`/student/courses`)}>
                <CardContent className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.code}</p>
                  <p className="mt-1 font-serif text-xl text-foreground">{course.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{course.instructor} · {course.term} {course.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
