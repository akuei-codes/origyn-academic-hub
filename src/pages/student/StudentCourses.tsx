import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

export default function StudentCourses() {
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['student-courses', user?.id],
    queryFn: () => api.getStudentCourses(user!.id),
    enabled: !!user?.id,
  });

  return (
    <AppLayout>
      <PageHeader title="My Courses" description="Courses you are currently enrolled in" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses"
          description="Accept an invitation from a professor to enroll in a course."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course: any) => (
            <Card key={course.id} className="animate-fade-in transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.code}</p>
                <h3 className="mt-1 font-serif text-xl text-foreground">{course.title}</h3>
                <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>{course.term} {course.year}</span>
                  <Link to={`/student/courses/${course.id}/assignments`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      Assignments <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
