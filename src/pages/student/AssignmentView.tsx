import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, PenLine, FileText, Shield } from 'lucide-react';
import { DEMO_ASSIGNMENTS } from '@/lib/demo-data';
import { format } from 'date-fns';

export default function AssignmentView() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === assignmentId) || DEMO_ASSIGNMENTS[0];

  return (
    <AppLayout>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </Button>

      <PageHeader title={assignment.title}>
        {assignment.due_date && (
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="h-3 w-3" />
            Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}
          </Badge>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Instructions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                {assignment.instructions || 'No instructions provided.'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {assignment.settings.time_limit_minutes && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time limit</span>
                  <span className="font-medium">{assignment.settings.time_limit_minutes} minutes</span>
                </div>
              )}
              {assignment.settings.min_word_count && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Word count</span>
                  <span className="font-medium">{assignment.settings.min_word_count}–{assignment.settings.max_word_count}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paste allowed</span>
                <span className="font-medium">{assignment.settings.paste_allowed ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Multiple sessions</span>
                <span className="font-medium">{assignment.settings.multiple_sessions ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Session notice */}
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your writing process will be observed during this session. Origyn captures process signals
                  to support instructor review. No content leaves the session environment.
                </p>
              </div>
            </CardContent>
          </Card>

          <Link to={`/student/courses/${courseId}/assignments/${assignmentId}/write`}>
            <Button className="w-full gap-2" size="lg">
              <PenLine className="h-4 w-4" />
              Start Writing
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
