import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Users, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

export default function CourseList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['professor-courses', user?.id],
    queryFn: () => api.getProfessorCourses(user!.id),
    enabled: !!user?.id,
  });

  return (
    <AppLayout>
      <PageHeader title="Courses" description="Manage your academic writing courses">
        <Button onClick={() => navigate('/professor/courses/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to begin."
          actionLabel="Create Course"
          onAction={() => navigate('/professor/courses/new')}
        />
      ) : (
        <div className="space-y-3">
          {courses.map((course: any) => (
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
                      <Badge variant={course.is_active ? 'default' : 'secondary'} className="text-xs">
                        {course.is_active ? 'Active' : 'Archived'}
                      </Badge>
                    </div>
                    <p className="font-serif text-lg text-foreground">{course.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.student_count || 0} students</span>
                      {(course.pending_invites || 0) > 0 && (
                        <span className="flex items-center gap-1 text-primary"><Mail className="h-3 w-3" />{course.pending_invites} pending</span>
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
