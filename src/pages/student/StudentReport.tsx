import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProcessReportView } from '@/components/report/ProcessReport';
import { DEMO_REPORT } from '@/lib/demo-data';

export default function StudentReport() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

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
      <ProcessReportView report={DEMO_REPORT} />
    </AppLayout>
  );
}
