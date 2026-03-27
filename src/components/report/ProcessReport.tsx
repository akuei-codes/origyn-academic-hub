import type { ProcessReport as ProcessReportType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TimelineVisualization } from './TimelineVisualization';
import { Clock, Keyboard, Edit3, Layers, Info } from 'lucide-react';

interface ProcessReportProps {
  report: ProcessReportType;
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function labelColor(level: string): 'default' | 'secondary' | 'destructive' {
  if (level.toLowerCase().includes('low')) return 'secondary';
  if (level.toLowerCase().includes('high')) return 'destructive';
  return 'default';
}

export function ProcessReportView({ report }: ProcessReportProps) {
  const { metrics, timeline, summary_labels } = report;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary badges */}
      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={labelColor(summary_labels.paste_dependence)}>{summary_labels.paste_dependence}</Badge>
            <Badge variant={labelColor(summary_labels.revision_depth)}>{summary_labels.revision_depth}</Badge>
            <Badge variant={labelColor(summary_labels.drafting_pattern)}>{summary_labels.drafting_pattern}</Badge>
            <Badge variant={labelColor(summary_labels.session_continuity)}>{summary_labels.session_continuity}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Session Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="font-serif text-lg">Session Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          <MetricRow label="Total sessions" value={metrics.session.total_sessions} />
          <MetricRow label="Total elapsed time" value={formatDuration(metrics.session.total_elapsed_seconds)} />
          <MetricRow label="Active writing time" value={formatDuration(metrics.session.active_writing_seconds)} />
          <MetricRow label="Idle time" value={formatDuration(metrics.session.idle_seconds)} />
          <MetricRow label="Focus interruptions" value={metrics.session.focus_blur_count} />
          <MetricRow label="Autosaves" value={metrics.session.autosave_count} />
        </CardContent>
      </Card>

      {/* Section 2: Input Behavior */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            <CardTitle className="font-serif text-lg">Input Behavior</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          <MetricRow label="Typed characters" value={metrics.input.typed_characters.toLocaleString()} />
          <MetricRow label="Pasted characters" value={metrics.input.pasted_characters.toLocaleString()} />
          <MetricRow label="Paste events" value={metrics.input.paste_event_count} />
          <MetricRow label="Cut events" value={metrics.input.cut_count} />
          <MetricRow label="Deletions (backspace + delete)" value={metrics.input.backspace_count + metrics.input.delete_count} />
          <MetricRow label="Typing bursts" value={metrics.input.insertion_bursts} />
          <MetricRow label="Pauses detected" value={metrics.input.pause_count} />
          <MetricRow label="Typed vs. pasted ratio" value={`${Math.round(metrics.input.typed_vs_pasted_ratio * 100)}% typed`} />
        </CardContent>
      </Card>

      {/* Section 3: Revision Behavior */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            <CardTitle className="font-serif text-lg">Revision Behavior</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          <MetricRow label="Edits to earlier sections" value={metrics.revision.edits_to_earlier_sections} />
          <MetricRow label="Return edits" value={metrics.revision.return_edits} />
          <MetricRow label="Paragraph rewrites" value={metrics.revision.paragraph_rewrites} />
        </CardContent>
      </Card>

      {/* Section 4: Composition Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="font-serif text-lg">Composition Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Drafting pattern:{' '}
            <span className="font-medium text-foreground">
              {metrics.composition.drafting_pattern.replace(/_/g, ' ')}
            </span>
          </p>
          {metrics.composition.revisited_earlier_paragraphs && (
            <p className="mt-1 text-sm text-muted-foreground">
              Earlier paragraphs were revisited during the writing process.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg">Writing Timeline</CardTitle>
          <CardDescription>Word count progression and key events during the session</CardDescription>
        </CardHeader>
        <CardContent>
          <TimelineVisualization events={timeline} />
        </CardContent>
      </Card>

      {/* Section 6: Explanatory Note */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              This report summarizes process signals captured during the approved Origyn writing session
              and is intended as contextual evidence for instructor review. It does not make claims about
              AI usage, originality, or academic integrity. Writing processes vary naturally across individuals
              and assignments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
