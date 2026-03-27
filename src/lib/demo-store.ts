// In-memory store for demo mode — persists across navigations within the session
import type { Course, Assignment, AssignmentSettings, Submission, ProcessMetrics, ProcessReport, TimelineEvent } from './types';

interface DemoCourse extends Course {
  instructor_id: string;
}

interface DemoInvitation {
  id: string;
  course_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  accepted_at?: string;
}

interface DemoEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  status: 'active' | 'dropped' | 'completed';
}

interface DemoSubmission extends Submission {
  report?: ProcessReport;
}

interface DemoSession {
  id: string;
  assignment_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
}

function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

// Seed data
const PROF_ID = 'demo-prof-1';
const STUDENT_ID = 'demo-student-1';
const COURSE_1_ID = uid();
const COURSE_2_ID = uid();
const ASSIGN_1_ID = uid();
const ASSIGN_2_ID = uid();

const demoMetrics: ProcessMetrics = {
  session: { total_sessions: 1, total_elapsed_seconds: 4320, active_writing_seconds: 3180, idle_seconds: 1140, focus_blur_count: 4, exits_and_returns: 2, autosave_count: 12, session_continuity: 'high' },
  input: { typed_characters: 8420, pasted_characters: 340, paste_event_count: 2, paste_sizes: [180, 160], cut_count: 3, delete_count: 45, backspace_count: 312, insertion_bursts: 87, deletion_bursts: 24, avg_burst_length: 12, pause_count: 34, typed_vs_pasted_ratio: 0.96, paste_dependence: 'low' },
  revision: { edits_to_earlier_sections: 8, return_edits: 5, paragraph_rewrites: 2, revision_depth: 'medium', revision_density_over_time: [2, 5, 8, 12, 18, 22, 25, 28, 30, 32, 34, 35] },
  composition: { drafting_pattern: 'moderately_iterative', composition_order: ['intro', 'body-1', 'body-2', 'intro-revision', 'body-3', 'conclusion', 'body-2-revision'], revisited_earlier_paragraphs: true },
};

const demoTimeline: TimelineEvent[] = [
  { timestamp: '2026-04-10T14:00:00Z', type: 'session_start', word_count: 0, label: 'Session started' },
  { timestamp: '2026-04-10T14:05:00Z', type: 'autosave', word_count: 85 },
  { timestamp: '2026-04-10T14:12:00Z', type: 'autosave', word_count: 240 },
  { timestamp: '2026-04-10T14:18:00Z', type: 'paste', word_count: 280, label: 'Pasted 180 chars' },
  { timestamp: '2026-04-10T14:20:00Z', type: 'blur', word_count: 310, label: 'Left editor' },
  { timestamp: '2026-04-10T14:22:00Z', type: 'focus', word_count: 310, label: 'Returned to editor' },
  { timestamp: '2026-04-10T14:30:00Z', type: 'autosave', word_count: 520 },
  { timestamp: '2026-04-10T14:40:00Z', type: 'autosave', word_count: 780 },
  { timestamp: '2026-04-10T14:48:00Z', type: 'autosave', word_count: 1020 },
  { timestamp: '2026-04-10T14:55:00Z', type: 'paste', word_count: 1060, label: 'Pasted 160 chars' },
  { timestamp: '2026-04-10T15:00:00Z', type: 'autosave', word_count: 1280 },
  { timestamp: '2026-04-10T15:08:00Z', type: 'autosave', word_count: 1450 },
  { timestamp: '2026-04-10T15:12:00Z', type: 'autosave', word_count: 1620 },
  { timestamp: '2026-04-10T15:12:30Z', type: 'session_end', word_count: 1620, label: 'Submitted' },
];

const essayContent = `The Waste Land, published in 1922, stands as one of the most revolutionary poems of the twentieth century. T.S. Eliot's masterwork employs fragmentation not merely as a stylistic device but as a fundamental principle of composition that mirrors the shattered consciousness of post-war modernity.

Eliot's use of fragmentation operates on multiple levels simultaneously. At the surface level, the poem's five sections present a disjointed series of voices, images, and allusions that resist conventional narrative coherence. The opening lines of "The Burial of the Dead" immediately establish this principle.

The fragmentation deepens through Eliot's technique of juxtaposition. In "A Game of Chess," the ornate description of the upper-class woman's boudoir is set against the working-class pub conversation about Lil and her husband. These two scenes are not connected by narrative logic but by thematic resonance.

Perhaps most significantly, Eliot's fragmentation extends to language itself. The poem incorporates passages in German, French, Italian, and Sanskrit, creating a babel of tongues that suggests both the cosmopolitan scope of Western culture and its ultimate inability to communicate coherent meaning.

This multilingual fragmentation connects to the broader modernist project of questioning inherited forms. Where Victorian poetry maintained formal unity even when addressing themes of doubt and loss, Eliot's method insists that form must embody the crisis of meaning.

The implications for literary criticism are significant. Reading The Waste Land demands a new kind of attention—one that accepts discontinuity as meaningful rather than seeking to resolve it.`;

class DemoStore {
  courses: DemoCourse[] = [];
  invitations: DemoInvitation[] = [];
  enrollments: DemoEnrollment[] = [];
  assignments: Assignment[] = [];
  submissions: DemoSubmission[] = [];
  sessions: DemoSession[] = [];
  private _version = 0;

  constructor() {
    this._seed();
  }

  private _seed() {
    this.courses = [
      { id: COURSE_1_ID, institution_id: '', title: 'Advanced Expository Writing', code: 'WRI 305', term: 'Spring', year: 2026, is_active: true, created_at: now(), updated_at: now(), instructor_id: PROF_ID },
      { id: COURSE_2_ID, institution_id: '', title: 'Creative Nonfiction Workshop', code: 'WRI 210', term: 'Spring', year: 2026, is_active: true, created_at: now(), updated_at: now(), instructor_id: PROF_ID },
    ];
    this.enrollments = [
      { id: uid(), course_id: COURSE_1_ID, user_id: STUDENT_ID, enrolled_at: '2026-01-15T00:00:00Z', status: 'active' },
    ];
    this.invitations = [
      { id: uid(), course_id: COURSE_2_ID, email: 'student@princeton.edu', invited_by: PROF_ID, status: 'pending', created_at: '2026-03-22T00:00:00Z' },
    ];
    this.assignments = [
      {
        id: ASSIGN_1_ID, course_id: COURSE_1_ID, title: 'Analytical Essay on Modernist Poetry',
        description: 'Write a 1500–2000 word analytical essay examining the use of fragmentation in T.S. Eliot\'s The Waste Land.',
        instructions: '## Assignment Instructions\n\nWrite a **1500–2000 word analytical essay** examining the use of fragmentation in T.S. Eliot\'s *The Waste Land*.\n\n### Requirements\n\n1. Develop a clear thesis\n2. Analyze at least three specific passages\n3. Connect your analysis to the broader modernist movement\n4. Use proper MLA citation format',
        due_date: '2026-04-15T23:59:00Z',
        settings: { paste_allowed: false, leave_and_return: false, multiple_sessions: false, student_can_view_report: true, min_word_count: 1500, max_word_count: 2000 },
        is_published: true, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z',
      },
      {
        id: ASSIGN_2_ID, course_id: COURSE_1_ID, title: 'Close Reading Response',
        description: 'A short in-class timed writing exercise.',
        instructions: '## Close Reading\n\nYou have **45 minutes** to write a close reading of the provided passage.',
        due_date: '2026-04-08T15:00:00Z',
        settings: { paste_allowed: false, leave_and_return: false, multiple_sessions: false, student_can_view_report: false, time_limit_minutes: 45 },
        is_published: true, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z',
      },
    ];
    const sub1Id = uid();
    this.submissions = [
      {
        id: sub1Id, assignment_id: ASSIGN_1_ID, user_id: STUDENT_ID, content: essayContent,
        word_count: 1620, status: 'submitted', submitted_at: '2026-04-10T15:12:30Z',
        created_at: '2026-04-10T14:00:00Z', updated_at: '2026-04-10T15:12:30Z',
        student_name: 'Alex Chen', student_email: 'student@princeton.edu', metrics: demoMetrics,
        report: {
          submission_id: sub1Id, generated_at: now(), metrics: demoMetrics, timeline: demoTimeline,
          summary_labels: { paste_dependence: 'Low paste dependence', revision_depth: 'Medium revision depth', drafting_pattern: 'Moderately iterative drafting', session_continuity: 'High session continuity' },
        },
      },
    ];
  }

  get version() { return this._version; }
  private bump() { this._version++; }

  // ── Courses ──
  getProfessorCourses(userId: string): DemoCourse[] {
    return this.courses.filter(c => c.instructor_id === userId);
  }

  getStudentCourses(userId: string): (DemoCourse & { instructor_name?: string })[] {
    const enrolledIds = this.enrollments.filter(e => e.user_id === userId && e.status === 'active').map(e => e.course_id);
    return this.courses.filter(c => enrolledIds.includes(c.id)).map(c => ({ ...c, instructor_name: 'Dr. Eleanor Vance' }));
  }

  getCourse(courseId: string): DemoCourse | undefined {
    return this.courses.find(c => c.id === courseId);
  }

  createCourse(data: { title: string; code: string; description?: string; term: string; year: number }, userId: string): DemoCourse {
    const course: DemoCourse = { id: uid(), institution_id: '', ...data, is_active: true, created_at: now(), updated_at: now(), instructor_id: userId };
    this.courses.push(course);
    this.bump();
    return course;
  }

  // ── Invitations ──
  getCourseInvitations(courseId: string): DemoInvitation[] {
    return this.invitations.filter(i => i.course_id === courseId);
  }

  getStudentInvitations(email: string): (DemoInvitation & { course_title: string; course_code: string; inviter_name: string })[] {
    return this.invitations
      .filter(i => i.email === email && i.status === 'pending')
      .map(i => {
        const course = this.courses.find(c => c.id === i.course_id);
        return { ...i, course_title: course?.title || '', course_code: course?.code || '', inviter_name: 'Dr. Eleanor Vance' };
      });
  }

  createInvitation(courseId: string, email: string, invitedBy: string): DemoInvitation {
    const existing = this.invitations.find(i => i.course_id === courseId && i.email === email);
    if (existing) throw new Error('Already invited');
    const inv: DemoInvitation = { id: uid(), course_id: courseId, email, invited_by: invitedBy, status: 'pending', created_at: now() };
    this.invitations.push(inv);
    this.bump();
    return inv;
  }

  acceptInvitation(invitationId: string, userId: string): void {
    const inv = this.invitations.find(i => i.id === invitationId);
    if (!inv) throw new Error('Invitation not found');
    inv.status = 'accepted';
    inv.accepted_at = now();
    // Create enrollment
    const existing = this.enrollments.find(e => e.course_id === inv.course_id && e.user_id === userId);
    if (!existing) {
      this.enrollments.push({ id: uid(), course_id: inv.course_id, user_id: userId, enrolled_at: now(), status: 'active' });
    }
    this.bump();
  }

  declineInvitation(invitationId: string): void {
    const inv = this.invitations.find(i => i.id === invitationId);
    if (inv) { inv.status = 'declined'; this.bump(); }
  }

  // ── Enrollments ──
  getCourseEnrollments(courseId: string): { id: string; user_id: string; name: string; email: string; enrolled_at: string }[] {
    return this.enrollments
      .filter(e => e.course_id === courseId && e.status === 'active')
      .map(e => ({
        id: e.id, user_id: e.user_id,
        name: e.user_id === STUDENT_ID ? 'Alex Chen' : 'Student',
        email: e.user_id === STUDENT_ID ? 'student@princeton.edu' : 'unknown@princeton.edu',
        enrolled_at: e.enrolled_at,
      }));
  }

  // ── Assignments ──
  getCourseAssignments(courseId: string): Assignment[] {
    return this.assignments.filter(a => a.course_id === courseId);
  }

  getPublishedAssignments(courseId: string): Assignment[] {
    return this.assignments.filter(a => a.course_id === courseId && a.is_published);
  }

  getAssignment(assignmentId: string): Assignment | undefined {
    return this.assignments.find(a => a.id === assignmentId);
  }

  createAssignment(data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Assignment {
    const assignment: Assignment = { ...data, id: uid(), created_at: now(), updated_at: now() };
    this.assignments.push(assignment);
    this.bump();
    return assignment;
  }

  // ── Submissions ──
  getAssignmentSubmissions(assignmentId: string): DemoSubmission[] {
    return this.submissions.filter(s => s.assignment_id === assignmentId);
  }

  getSubmission(submissionId: string): DemoSubmission | undefined {
    return this.submissions.find(s => s.id === submissionId);
  }

  getOrCreateSubmission(assignmentId: string, userId: string): DemoSubmission {
    let sub = this.submissions.find(s => s.assignment_id === assignmentId && s.user_id === userId);
    if (!sub) {
      sub = {
        id: uid(), assignment_id: assignmentId, user_id: userId, content: '', word_count: 0,
        status: 'draft', created_at: now(), updated_at: now(),
        student_name: 'Alex Chen', student_email: 'student@princeton.edu',
      };
      this.submissions.push(sub);
      this.bump();
    }
    return sub;
  }

  updateSubmissionContent(submissionId: string, content: string, wordCount: number): void {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.content = content;
      sub.word_count = wordCount;
      sub.status = sub.status === 'draft' ? 'in_progress' : sub.status;
      sub.updated_at = now();
      this.bump();
    }
  }

  submitSubmission(submissionId: string, metrics: ProcessMetrics): void {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.status = 'submitted';
      sub.submitted_at = now();
      sub.metrics = metrics;
      sub.report = {
        submission_id: submissionId, generated_at: now(), metrics,
        timeline: demoTimeline,
        summary_labels: {
          paste_dependence: `${metrics.input.paste_dependence.charAt(0).toUpperCase() + metrics.input.paste_dependence.slice(1)} paste dependence`,
          revision_depth: `${metrics.revision.revision_depth.charAt(0).toUpperCase() + metrics.revision.revision_depth.slice(1)} revision depth`,
          drafting_pattern: metrics.composition.drafting_pattern.replace(/_/g, ' '),
          session_continuity: `${metrics.session.session_continuity.charAt(0).toUpperCase() + metrics.session.session_continuity.slice(1)} session continuity`,
        },
      };
      this.bump();
    }
  }

  getReport(submissionId: string): ProcessReport | undefined {
    return this.submissions.find(s => s.id === submissionId)?.report;
  }

  // ── Sessions ──
  getOrCreateSession(assignmentId: string, userId: string): DemoSession {
    let session = this.sessions.find(s => s.assignment_id === assignmentId && s.user_id === userId && s.is_active);
    if (!session) {
      session = { id: uid(), assignment_id: assignmentId, user_id: userId, started_at: now(), is_active: true };
      this.sessions.push(session);
      this.bump();
    }
    return session;
  }

  endSession(sessionId: string): void {
    const s = this.sessions.find(s => s.id === sessionId);
    if (s) { s.ended_at = now(); s.is_active = false; this.bump(); }
  }
}

export const demoStore = new DemoStore();
