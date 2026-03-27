import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const DEMO_ENROLLED = [
  { id: '1', title: 'Advanced Expository Writing', code: 'WRI 305', term: 'Spring', year: 2026, instructor: 'Dr. Eleanor Vance', assignmentsDue: 1 },
];

export default function StudentCourses() {
  return (
    <AppLayout>
      <PageHeader title="My Courses" description="Courses you are currently enrolled in" />

      {DEMO_ENROLLED.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses"
          description="Accept an invitation from a professor to enroll in a course."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {DEMO_ENROLLED.map((course) => (
            <Card key={course.id} className="animate-fade-in transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.code}</p>
                <h3 className="mt-1 font-serif text-xl text-foreground">{course.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{course.instructor}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>{course.term} {course.year}</span>
                  {course.assignmentsDue > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                      {course.assignmentsDue} due
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
