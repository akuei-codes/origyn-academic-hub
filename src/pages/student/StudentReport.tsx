import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProcessReportView } from '@/components/report/ProcessReport';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';

export default function StudentReport() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: submission } = useQuery({
    queryKey: ['student-submission', assignmentId, user?.id],
    queryFn: () => api.getStudentSubmission(assignmentId!, user!.id),
    enabled: !!assignmentId && !!user?.id,
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['student-report', submission?.id],
    queryFn: () => api.getReport(submission!.id),
    enabled: !!submission?.id,
  });

  const reportData = report || submission?.report;

  return (
    <AppLayout>
      <Button
        variant="ghost"
        onClick={() => navigate(`/student/courses/${courseId}/assignments/${assignmentId}`)}
        className="mb-4 -ml-2 gap-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignment
      </Button>
      <PageHeader title="Your Writing Process Report" description="A summary of how your document was produced inside Origyn" />
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : reportData ? (
        <ProcessReportView report={reportData} />
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No report available yet.</CardContent></Card>
      )}
    </AppLayout>
  );
}
