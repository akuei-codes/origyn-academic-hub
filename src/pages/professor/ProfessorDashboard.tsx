import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Mail, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['professor-courses', user?.id],
    queryFn: () => api.getProfessorCourses(user!.id),
    enabled: !!user?.id,
  });

  const totalStudents = courses.reduce((a: number, c: any) => a + (c.student_count || 0), 0);
  const totalPending = courses.reduce((a: number, c: any) => a + (c.pending_invites || 0), 0);

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Professor'}`}
        description="Your academic writing courses at a glance"
      >
        <Button onClick={() => navigate('/professor/courses/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Active Courses" value={courses.length} />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        <StatCard icon={Mail} label="Pending Invitations" value={totalPending} />
      </div>

      <div>
        <h2 className="mb-4 font-serif text-2xl text-foreground">Your Courses</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course to start inviting students and assigning writing."
            actionLabel="Create Course"
            onAction={() => navigate('/professor/courses/new')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course: any) => (
              <Card
                key={course.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/professor/courses/${course.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">{course.code}</p>
                      <CardTitle className="mt-1 font-serif text-xl">{course.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.student_count || 0} students
                    </span>
                    {(course.pending_invites || 0) > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <Mail className="h-3.5 w-3.5" />
                        {course.pending_invites} pending
                      </span>
                    )}
                    <span className="ml-auto text-xs">{course.term} {course.year}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
