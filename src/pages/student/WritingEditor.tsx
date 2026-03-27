import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useWritingTracker } from '@/hooks/useWritingTracker';
import { useAutosave } from '@/hooks/useAutosave';
import { useTimer } from '@/hooks/useTimer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import {
  BookOpen, Clock, Save, Send, Loader2, CheckCircle2, AlertCircle, GraduationCap,
} from 'lucide-react';

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export default function WritingEditor() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: assignment } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => api.getAssignment(assignmentId!),
    enabled: !!assignmentId,
  });

  const { data: submission, isLoading: loadingSub } = useQuery({
    queryKey: ['editor-submission', assignmentId, user?.id],
    queryFn: () => api.getOrCreateSubmission(assignmentId!, user!.id),
    enabled: !!assignmentId && !!user?.id,
  });

  const [content, setContent] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = countWords(content);

  // Initialize content from existing submission
  useEffect(() => {
    if (submission && !initialized) {
      setContent(submission.content || '');
      setInitialized(true);
    }
  }, [submission, initialized]);

  const settings = assignment?.settings || { paste_allowed: false };
  const tracker = useWritingTracker(settings.paste_allowed);

  const saveMutation = useMutation({
    mutationFn: async (data: string) => {
      if (submission?.id) {
        await api.saveSubmissionContent(submission.id, data, countWords(data));
      }
      tracker.recordAutosave(countWords(data));
    },
  });

  const { status: saveStatus } = useAutosave({
    data: content,
    onSave: async (data) => {
      await saveMutation.mutateAsync(data);
    },
  });

  const timer = useTimer({
    limitMinutes: settings.time_limit_minutes,
    onTimeUp: () => {
      toast({ title: 'Time is up', description: 'Your writing has been autosaved. Please submit.' });
    },
  });

  useEffect(() => {
    if (initialized) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const handleSubmit = useCallback(async () => {
    if (!submission?.id) return;
    setIsSubmitting(true);
    const metrics = tracker.computeMetrics();
    await api.submitSubmission(submission.id, content, wordCount, metrics);
    setIsSubmitting(false);
    setShowSubmitDialog(false);
    toast({ title: 'Submitted', description: 'Your writing has been submitted successfully.' });
    navigate(`/student/courses/${courseId}/assignments/${assignmentId}`);
  }, [tracker, toast, navigate, courseId, assignmentId, submission, content, wordCount]);

  const saveIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'saved': return <CheckCircle2 className="h-3 w-3 text-success" />;
      case 'error': return <AlertCircle className="h-3 w-3 text-destructive" />;
      default: return <Save className="h-3 w-3" />;
    }
  };
  const saveLabel = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving…';
      case 'saved': return 'Saved';
      case 'error': return 'Save error';
      default: return 'Idle';
    }
  };

  const minMet = !settings.min_word_count || wordCount >= settings.min_word_count;
  const maxExceeded = settings.max_word_count && wordCount > settings.max_word_count;

  if (loadingSub || !assignment) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-medium text-foreground">{assignment.title}</h1>
            <p className="text-xs text-muted-foreground">Origyn Writing Session</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveIcon()}
            <span>{saveLabel()}</span>
          </div>

          {settings.time_limit_minutes ? (
            <Badge variant={timer.remainingSeconds && timer.remainingSeconds < 300 ? 'destructive' : 'secondary'} className="gap-1.5 font-mono">
              <Clock className="h-3 w-3" />
              {timer.formattedRemaining}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 font-mono">
              <Clock className="h-3 w-3" />
              {timer.formattedElapsed}
            </Badge>
          )}

          <Badge
            variant="secondary"
            className={`font-mono ${maxExceeded ? 'border-destructive text-destructive' : !minMet ? 'border-warning text-warning' : ''}`}
          >
            {wordCount.toLocaleString()} words
          </Badge>

          <Button variant="ghost" size="sm" onClick={() => setShowInstructions(true)} className="gap-1.5 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Instructions</span>
          </Button>

          <Button size="sm" onClick={() => setShowSubmitDialog(true)} className="gap-1.5">
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => tracker.handleKeyDown(e, countWords(content))}
            onPaste={(e) => tracker.handlePaste(e, countWords(content))}
            onCut={(e) => tracker.handleCut(e, countWords(content))}
            onFocus={() => tracker.handleFocus(countWords(content))}
            onBlur={() => tracker.handleBlur(countWords(content))}
            placeholder="Begin writing…"
            className="w-full resize-none border-0 bg-transparent font-serif text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
            style={{ minHeight: 'calc(100vh - 200px)' }}
            autoFocus
          />
        </div>
      </div>

      <Sheet open={showInstructions} onOpenChange={setShowInstructions}>
        <SheetContent className="overflow-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-serif">Instructions</SheetTitle>
            <SheetDescription>{assignment.title}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {assignment.instructions || 'No instructions provided.'}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Submit your writing?</DialogTitle>
            <DialogDescription>
              This will finalize your submission. You will not be able to edit after submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Word count</span>
              <span className="font-medium">{wordCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Writing time</span>
              <span className="font-medium">{timer.formattedElapsed}</span>
            </div>
            {!minMet && (
              <p className="text-xs text-warning">
                ⚠ Below minimum word count ({settings.min_word_count} words)
              </p>
            )}
            {maxExceeded && (
              <p className="text-xs text-destructive">
                ⚠ Exceeds maximum word count ({settings.max_word_count} words)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
