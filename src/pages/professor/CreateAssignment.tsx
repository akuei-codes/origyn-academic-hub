import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { AssignmentSettings } from '@/lib/types';

export default function CreateAssignment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [settings, setSettings] = useState<AssignmentSettings>({
    paste_allowed: false,
    leave_and_return: false,
    multiple_sessions: false,
    student_can_view_report: false,
  });
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [minWords, setMinWords] = useState('');
  const [maxWords, setMaxWords] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please enter an assignment title.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Assignment created', description: `"${title}" has been created successfully.` });
    navigate(`/professor/courses/${courseId}`);
  };

  return (
    <AppLayout>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Button>
      <PageHeader title="New Assignment" description="Create a writing assignment for your students" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Analytical Essay on Modernist Poetry" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Write detailed instructions for students. Markdown formatting is supported."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Select a due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Word Count</CardTitle>
              <CardDescription>Set optional word count requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWords">Minimum words</Label>
                  <Input id="minWords" type="number" placeholder="e.g. 500" value={minWords} onChange={(e) => setMinWords(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWords">Maximum words</Label>
                  <Input id="maxWords" type="number" placeholder="e.g. 2000" value={maxWords} onChange={(e) => setMaxWords(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Settings</CardTitle>
              <CardDescription>Configure assignment behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time limit (minutes)</Label>
                <Input id="timeLimit" type="number" placeholder="No limit" value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(e.target.value)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Allow paste</Label>
                  <p className="text-xs text-muted-foreground">Students can paste content</p>
                </div>
                <Switch checked={settings.paste_allowed} onCheckedChange={(v) => setSettings((s) => ({ ...s, paste_allowed: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Leave &amp; return</Label>
                  <p className="text-xs text-muted-foreground">Students can exit and resume</p>
                </div>
                <Switch checked={settings.leave_and_return} onCheckedChange={(v) => setSettings((s) => ({ ...s, leave_and_return: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Multiple sessions</Label>
                  <p className="text-xs text-muted-foreground">Allow multiple writing sessions</p>
                </div>
                <Switch checked={settings.multiple_sessions} onCheckedChange={(v) => setSettings((s) => ({ ...s, multiple_sessions: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Student report</Label>
                  <p className="text-xs text-muted-foreground">Students can view their report</p>
                </div>
                <Switch checked={settings.student_can_view_report} onCheckedChange={(v) => setSettings((s) => ({ ...s, student_can_view_report: v }))} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleCreate} className="w-full" size="lg">
            Create Assignment
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
