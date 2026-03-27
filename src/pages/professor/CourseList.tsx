import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Users, Mail, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DEMO_COURSES = [
  { id: '1', title: 'Advanced Expository Writing', code: 'WRI 305', term: 'Spring', year: 2026, studentCount: 12, pendingInvites: 3, isActive: true },
  { id: '2', title: 'Creative Nonfiction Workshop', code: 'WRI 210', term: 'Spring', year: 2026, studentCount: 8, pendingInvites: 0, isActive: true },
  { id: '3', title: 'Freshman Writing Seminar', code: 'WRI 101', term: 'Fall', year: 2025, studentCount: 15, pendingInvites: 0, isActive: false },
];

export default function CourseList() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <PageHeader title="Courses" description="Manage your academic writing courses">
        <Button onClick={() => navigate('/professor/courses/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </PageHeader>

      {DEMO_COURSES.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to begin."
          actionLabel="Create Course"
          onAction={() => navigate('/professor/courses/new')}
        />
      ) : (
        <div className="space-y-3">
          {DEMO_COURSES.map((course) => (
            <Card
              key={course.id}
              className="group cursor-pointer transition-shadow hover:shadow-md animate-fade-in"
              onClick={() => navigate(`/professor/courses/${course.id}`)}
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-accent p-2.5">
                    <BookOpen className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.code}</p>
                      <Badge variant={course.isActive ? 'default' : 'secondary'} className="text-xs">
                        {course.isActive ? 'Active' : 'Archived'}
                      </Badge>
                    </div>
                    <p className="font-serif text-lg text-foreground">{course.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.studentCount} students</span>
                      {course.pendingInvites > 0 && (
                        <span className="flex items-center gap-1 text-primary"><Mail className="h-3 w-3" />{course.pendingInvites} pending</span>
                      )}
                      <span>{course.term} {course.year}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
