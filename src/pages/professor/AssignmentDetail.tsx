import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Users, Clock, CheckCircle2 } from 'lucide-react';
import { DEMO_ASSIGNMENTS, DEMO_SUBMISSIONS } from '@/lib/demo-data';
import { format } from 'date-fns';

function continuityBadge(level: string) {
  const colors: Record<string, string> = {
    high: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return colors[level] || '';
}

export default function AssignmentDetail() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === assignmentId) || DEMO_ASSIGNMENTS[0];
  const submissions = DEMO_SUBMISSIONS.filter((s) => s.assignment_id === assignment.id);

  return (
    <AppLayout>
      <Button variant="ghost" onClick={() => navigate(`/professor/courses/${courseId}`)} className="mb-4 -ml-2 gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Button>
      <PageHeader title={assignment.title} description={assignment.description}>
        {assignment.due_date && (
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="h-3 w-3" />
            Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}
          </Badge>
        )}
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Submissions" value={submissions.length} />
        <StatCard icon={FileText} label="Word Count (avg)" value={Math.round(submissions.reduce((a, s) => a + s.word_count, 0) / (submissions.length || 1))} />
        <StatCard icon={Clock} label="Time Limit" value={assignment.settings.time_limit_minutes ? `${assignment.settings.time_limit_minutes}m` : 'None'} />
        <StatCard icon={CheckCircle2} label="Status" value={assignment.is_published ? 'Published' : 'Draft'} />
      </div>

      {/* Submissions table */}
      <Card className="animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Active Time</TableHead>
              <TableHead>Paste</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Continuity</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.student_name}</p>
                    <p className="text-xs text-muted-foreground">{sub.student_email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {sub.submitted_at ? format(new Date(sub.submitted_at), 'MMM d, h:mm a') : '—'}
                </TableCell>
                <TableCell className="font-medium">{sub.word_count.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {sub.metrics ? `${Math.round(sub.metrics.session.active_writing_seconds / 60)}m` : '—'}
                </TableCell>
                <TableCell>
                  {sub.metrics && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {sub.metrics.input.paste_dependence}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {sub.metrics && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {sub.metrics.revision.revision_depth}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {sub.metrics && (
                    <Badge className={`border text-xs capitalize ${continuityBadge(sub.metrics.session.session_continuity)}`}>
                      {sub.metrics.session.session_continuity}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link to={`/professor/courses/${courseId}/assignments/${assignmentId}/submissions/${sub.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
