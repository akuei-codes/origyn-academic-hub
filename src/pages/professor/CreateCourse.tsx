import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('spring');
  const [year, setYear] = useState(2026);

  const mutation = useMutation({
    mutationFn: () => api.createCourse({ title, code, description: description || undefined, term: term.charAt(0).toUpperCase() + term.slice(1), year }, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-courses'] });
      toast({ title: 'Course created', description: 'Your course has been created successfully.' });
      navigate('/professor/courses');
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    mutation.mutate();
  };

  return (
    <AppLayout>
      <PageHeader title="Create Course" description="Set up a new course space for academic writing" />

      <Card className="mx-auto max-w-2xl animate-fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Course Details</CardTitle>
          <CardDescription>Fill in the details below. You can update these later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input id="code" placeholder="e.g., WRI 305" required value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" placeholder="e.g., Advanced Expository Writing" required value={title} onChange={e => setTitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Brief course description…" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={year} onChange={e => setYear(Number(e.target.value))} required />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {mutation.isPending ? 'Creating…' : 'Create Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
