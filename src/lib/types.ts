export type UserRole = 'professor' | 'student';

export interface Institution {
  id: string;
  name: string;
  slug: string;
  domain: string;
  cas_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  institution_id?: string;
  net_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  user_id: string;
  role: UserRole;
  institution_id?: string;
  granted_at: string;
}

export interface ProfessorAllowlist {
  id: string;
  email: string;
  institution_id: string;
  added_by?: string;
  created_at: string;
}

export interface Course {
  id: string;
  institution_id: string;
  title: string;
  code: string;
  description?: string;
  term: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseInstructor {
  id: string;
  course_id: string;
  user_id: string;
  role: 'primary' | 'secondary';
  created_at: string;
}

export interface CourseInvitation {
  id: string;
  course_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  accepted_at?: string;
  course?: Course;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  status: 'active' | 'dropped' | 'completed';
  course?: Course;
}

// ── Assignment & Settings ──────────────────────────────────────────────

export interface AssignmentSettings {
  paste_allowed: boolean;
  leave_and_return: boolean;
  multiple_sessions: boolean;
  student_can_view_report: boolean;
  time_limit_minutes?: number;
  min_word_count?: number;
  max_word_count?: number;
}

export const DEFAULT_ASSIGNMENT_SETTINGS: AssignmentSettings = {
  paste_allowed: false,
  leave_and_return: false,
  multiple_sessions: false,
  student_can_view_report: false,
};

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  settings: AssignmentSettings;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ── Writing Sessions ───────────────────────────────────────────────────

export interface WritingSession {
  id: string;
  assignment_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  is_active: boolean;
}

// ── Submissions ────────────────────────────────────────────────────────

export type SubmissionStatus = 'draft' | 'in_progress' | 'submitted' | 'graded';

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string;
  word_count: number;
  status: SubmissionStatus;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  student_name?: string;
  student_email?: string;
  metrics?: ProcessMetrics;
}

// ── Writing Events ─────────────────────────────────────────────────────

export type WritingEventType =
  | 'keystroke'
  | 'paste'
  | 'cut'
  | 'delete'
  | 'backspace'
  | 'focus'
  | 'blur'
  | 'pause'
  | 'autosave'
  | 'session_start'
  | 'session_end';

export interface WritingEvent {
  id: string;
  session_id: string;
  submission_id: string;
  event_type: WritingEventType;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ── Process Metrics & Report ───────────────────────────────────────────

export interface SessionMetrics {
  total_sessions: number;
  total_elapsed_seconds: number;
  active_writing_seconds: number;
  idle_seconds: number;
  focus_blur_count: number;
  exits_and_returns: number;
  autosave_count: number;
  session_continuity: 'low' | 'medium' | 'high';
}

export interface InputMetrics {
  typed_characters: number;
  pasted_characters: number;
  paste_event_count: number;
  paste_sizes: number[];
  cut_count: number;
  delete_count: number;
  backspace_count: number;
  insertion_bursts: number;
  deletion_bursts: number;
  avg_burst_length: number;
  pause_count: number;
  typed_vs_pasted_ratio: number;
  paste_dependence: 'low' | 'medium' | 'high';
}

export interface RevisionMetrics {
  edits_to_earlier_sections: number;
  return_edits: number;
  paragraph_rewrites: number;
  revision_depth: 'low' | 'medium' | 'high';
  revision_density_over_time: number[];
}

export interface CompositionMetrics {
  drafting_pattern: 'mostly_linear' | 'moderately_iterative' | 'highly_iterative';
  composition_order: string[];
  revisited_earlier_paragraphs: boolean;
}

export interface ProcessMetrics {
  session: SessionMetrics;
  input: InputMetrics;
  revision: RevisionMetrics;
  composition: CompositionMetrics;
}

export interface TimelineEvent {
  timestamp: string;
  type: WritingEventType;
  word_count: number;
  label?: string;
}

export interface ProcessReport {
  submission_id: string;
  generated_at: string;
  metrics: ProcessMetrics;
  timeline: TimelineEvent[];
  summary_labels: {
    paste_dependence: string;
    revision_depth: string;
    drafting_pattern: string;
    session_continuity: string;
  };
}
