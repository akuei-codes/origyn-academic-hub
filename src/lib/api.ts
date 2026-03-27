import { supabase, isSupabaseConfigured } from './supabase';
import { demoStore } from './demo-store';
import type { Course, Assignment, AssignmentSettings, Submission, ProcessMetrics, ProcessReport } from './types';

// ── Courses ────────────────────────────────────────────────────────────

export async function getProfessorCourses(userId: string) {
  if (!isSupabaseConfigured()) {
    const courses = demoStore.getProfessorCourses(userId);
    return courses.map(c => ({
      ...c,
      student_count: demoStore.getCourseEnrollments(c.id).length,
      pending_invites: demoStore.getCourseInvitations(c.id).filter(i => i.status === 'pending').length,
    }));
  }
  const { data, error } = await supabase
    .from('course_instructors')
    .select('courses:course_id(*, course_enrollments(count), course_invitations(count))')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d.courses,
    student_count: d.courses.course_enrollments?.[0]?.count || 0,
    pending_invites: d.courses.course_invitations?.[0]?.count || 0,
  }));
}

export async function getStudentCourses(userId: string) {
  if (!isSupabaseConfigured()) {
    return demoStore.getStudentCourses(userId);
  }
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('courses:course_id(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;
  return (data || []).map((d: any) => d.courses);
}

export async function getCourse(courseId: string) {
  if (!isSupabaseConfigured()) return demoStore.getCourse(courseId) || null;
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
  if (error) throw error;
  return data;
}

export async function createCourse(data: { title: string; code: string; description?: string; term: string; year: number }, userId: string) {
  if (!isSupabaseConfigured()) return demoStore.createCourse(data, userId);
  const { data: course, error } = await supabase.from('courses').insert(data).select().single();
  if (error) throw error;
  await supabase.from('course_instructors').insert({ course_id: course.id, user_id: userId });
  return course;
}

// ── Invitations ────────────────────────────────────────────────────────

export async function getCourseInvitations(courseId: string) {
  if (!isSupabaseConfigured()) return demoStore.getCourseInvitations(courseId);
  const { data, error } = await supabase.from('course_invitations').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createInvitation(courseId: string, email: string, invitedBy: string) {
  if (!isSupabaseConfigured()) return demoStore.createInvitation(courseId, email, invitedBy);
  const { data, error } = await supabase.from('course_invitations').insert({ course_id: courseId, email, invited_by: invitedBy }).select().single();
  if (error) throw error;
  return data;
}

export async function getStudentInvitations(email: string) {
  if (!isSupabaseConfigured()) return demoStore.getStudentInvitations(email);
  const { data, error } = await supabase
    .from('course_invitations')
    .select('*, courses:course_id(title, code)')
    .eq('email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    course_title: d.courses?.title || '',
    course_code: d.courses?.code || '',
    inviter_name: 'Professor',
  }));
}

export async function acceptInvitation(invitationId: string, userId: string) {
  if (!isSupabaseConfigured()) { demoStore.acceptInvitation(invitationId, userId); return; }
  const { data: inv } = await supabase.from('course_invitations').select('course_id').eq('id', invitationId).single();
  if (!inv) throw new Error('Invitation not found');
  await supabase.from('course_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitationId);
  await supabase.from('course_enrollments').insert({ course_id: inv.course_id, user_id: userId });
}

export async function declineInvitation(invitationId: string) {
  if (!isSupabaseConfigured()) { demoStore.declineInvitation(invitationId); return; }
  await supabase.from('course_invitations').update({ status: 'declined' }).eq('id', invitationId);
}

// ── Enrollments ────────────────────────────────────────────────────────

export async function getCourseEnrollments(courseId: string) {
  if (!isSupabaseConfigured()) return demoStore.getCourseEnrollments(courseId);
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*, profiles:user_id(full_name, email)')
    .eq('course_id', courseId)
    .eq('status', 'active');
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.id, user_id: d.user_id,
    name: d.profiles?.full_name || '', email: d.profiles?.email || '',
    enrolled_at: d.enrolled_at,
  }));
}

// ── Assignments ────────────────────────────────────────────────────────

export async function getCourseAssignments(courseId: string, publishedOnly = false) {
  if (!isSupabaseConfigured()) return publishedOnly ? demoStore.getPublishedAssignments(courseId) : demoStore.getCourseAssignments(courseId);
  let query = supabase.from('assignments').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  if (publishedOnly) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAssignment(assignmentId: string) {
  if (!isSupabaseConfigured()) return demoStore.getAssignment(assignmentId) || null;
  const { data, error } = await supabase.from('assignments').select('*').eq('id', assignmentId).single();
  if (error) throw error;
  return data;
}

export async function createAssignment(data: {
  course_id: string; title: string; description?: string; instructions?: string;
  due_date?: string; settings: AssignmentSettings; is_published: boolean;
}) {
  if (!isSupabaseConfigured()) return demoStore.createAssignment(data);
  const { data: assignment, error } = await supabase.from('assignments').insert(data).select().single();
  if (error) throw error;
  return assignment;
}

// ── Submissions ────────────────────────────────────────────────────────

export async function getAssignmentSubmissions(assignmentId: string) {
  if (!isSupabaseConfigured()) return demoStore.getAssignmentSubmissions(assignmentId);
  const { data, error } = await supabase
    .from('submissions')
    .select('*, profiles:user_id(full_name, email), process_reports(*)')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    student_name: d.profiles?.full_name || '',
    student_email: d.profiles?.email || '',
    metrics: d.process_reports?.[0]?.metrics || null,
    report: d.process_reports?.[0] || null,
  }));
}

export async function getSubmission(submissionId: string) {
  if (!isSupabaseConfigured()) return demoStore.getSubmission(submissionId) || null;
  const { data, error } = await supabase
    .from('submissions')
    .select('*, profiles:user_id(full_name, email), process_reports(*)')
    .eq('id', submissionId)
    .single();
  if (error) throw error;
  return {
    ...data,
    student_name: data.profiles?.full_name || '',
    student_email: data.profiles?.email || '',
    metrics: data.process_reports?.[0]?.metrics || null,
    report: data.process_reports?.[0] || null,
  };
}

export async function getOrCreateSubmission(assignmentId: string, userId: string) {
  if (!isSupabaseConfigured()) return demoStore.getOrCreateSubmission(assignmentId, userId);
  // Try to find existing
  const { data: existing } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from('submissions')
    .insert({ assignment_id: assignmentId, user_id: userId, content: '', word_count: 0, status: 'draft' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveSubmissionContent(submissionId: string, content: string, wordCount: number) {
  if (!isSupabaseConfigured()) { demoStore.updateSubmissionContent(submissionId, content, wordCount); return; }
  await supabase.from('submissions').update({ content, word_count: wordCount, status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', submissionId);
}

export async function submitSubmission(submissionId: string, content: string, wordCount: number, metrics: ProcessMetrics) {
  if (!isSupabaseConfigured()) {
    demoStore.updateSubmissionContent(submissionId, content, wordCount);
    demoStore.submitSubmission(submissionId, metrics);
    return;
  }
  await supabase.from('submissions').update({
    content, word_count: wordCount, status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', submissionId);
  // Create process report
  await supabase.from('process_reports').insert({
    submission_id: submissionId, metrics, timeline: [], // Timeline would be built from writing_events
    summary_labels: {
      paste_dependence: `${metrics.input.paste_dependence} paste dependence`,
      revision_depth: `${metrics.revision.revision_depth} revision depth`,
      drafting_pattern: metrics.composition.drafting_pattern.replace(/_/g, ' '),
      session_continuity: `${metrics.session.session_continuity} session continuity`,
    },
  });
}

export async function getStudentSubmission(assignmentId: string, userId: string) {
  if (!isSupabaseConfigured()) {
    return demoStore.getAssignmentSubmissions(assignmentId).find(s => s.user_id === userId) || null;
  }
  const { data } = await supabase
    .from('submissions')
    .select('*, process_reports(*)')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, report: data.process_reports?.[0] || null, metrics: data.process_reports?.[0]?.metrics || null };
}

// ── Reports ────────────────────────────────────────────────────────────

export async function getReport(submissionId: string): Promise<ProcessReport | null> {
  if (!isSupabaseConfigured()) return demoStore.getReport(submissionId) || null;
  const { data, error } = await supabase.from('process_reports').select('*').eq('submission_id', submissionId).single();
  if (error) return null;
  return data;
}
