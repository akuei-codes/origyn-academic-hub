import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { ProcessReportView } from '@/components/report/ProcessReport';
import { DEMO_SUBMISSIONS, DEMO_REPORT } from '@/lib/demo-data';
import { format } from 'date-fns';

export default function SubmissionReview() {
  const { courseId, assignmentId, submissionId } = useParams();
  const navigate = useNavigate();

  const submission = DEMO_SUBMISSIONS.find((s) => s.id === submissionId) || DEMO_SUBMISSIONS[0];
  const report = { ...DEMO_REPORT, submission_id: submission.id, metrics: submission.metrics || DEMO_REPORT.metrics };

  return (
    <AppLayout>
      <Button
        variant="ghost"
        onClick={() => navigate(`/professor/courses/${courseId}/assignments/${assignmentId}`)}
        className="mb-4 -ml-2 gap-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Submissions
      </Button>

      <PageHeader title={submission.student_name || 'Student Submission'} description={submission.student_email}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5">
            <FileText className="h-3 w-3" />
            {submission.word_count.toLocaleString()} words
          </Badge>
          {submission.submitted_at && (
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="h-3 w-3" />
              {format(new Date(submission.submitted_at), 'MMM d, h:mm a')}
            </Badge>
          )}
        </div>
      </PageHeader>

      <Tabs defaultValue="report" className="animate-fade-in">
        <TabsList>
          <TabsTrigger value="report">Process Report</TabsTrigger>
          <TabsTrigger value="text">Submitted Text</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-6">
          <ProcessReportView report={report} />
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Final Submission</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.content ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif leading-relaxed text-foreground">
                  {submission.content}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Submission content not available in demo mode.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
