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

// Future entities (placeholder types)
export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  created_at: string;
}

export interface WritingSession {
  id: string;
  assignment_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content?: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'graded';
}
