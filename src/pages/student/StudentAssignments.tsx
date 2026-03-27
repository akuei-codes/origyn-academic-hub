import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DEMO_ASSIGNMENTS } from '@/lib/demo-data';
import { format } from 'date-fns';

export default function StudentAssignments() {
  const { courseId } = useParams();
  const assignments = DEMO_ASSIGNMENTS.filter((a) => a.course_id === 'course-1' && a.is_published);

  // Simulated submission states
  const submissionStates: Record<string, 'not_started' | 'in_progress' | 'submitted'> = {
    'assign-1': 'submitted',
    'assign-2': 'not_started',
  };

  return (
    <AppLayout>
      <PageHeader title="Assignments" description="Your writing assignments for this course" />

      {assignments.length === 0 ? (
        <EmptyState icon={FileText} title="No assignments yet" description="Your professor hasn't published any assignments for this course yet." />
      ) : (
        <div className="space-y-4 animate-fade-in">
          {assignments.map((assignment) => {
            const state = submissionStates[assignment.id] || 'not_started';
            return (
              <Card key={assignment.id} className="group transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg font-medium text-foreground">{assignment.title}</h3>
                      {state === 'submitted' && (
                        <Badge className="gap-1 bg-success/10 text-success border-success/20 border">
                          <CheckCircle2 className="h-3 w-3" />
                          Submitted
                        </Badge>
                      )}
                      {state === 'in_progress' && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      {assignment.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {assignment.settings.time_limit_minutes && (
                        <span>{assignment.settings.time_limit_minutes} min limit</span>
                      )}
                      {assignment.settings.min_word_count && (
                        <span>{assignment.settings.min_word_count}–{assignment.settings.max_word_count} words</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/student/courses/${courseId}/assignments/${assignment.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground group-hover:text-foreground">
                      {state === 'submitted' ? 'View' : state === 'in_progress' ? 'Continue' : 'Open'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
