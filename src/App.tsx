import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import CreateCourse from "./pages/professor/CreateCourse";
import CourseList from "./pages/professor/CourseList";
import CourseDetail from "./pages/professor/CourseDetail";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentInvitations from "./pages/student/StudentInvitations";
import StudentCourses from "./pages/student/StudentCourses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Professor routes */}
            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/courses" element={<CourseList />} />
            <Route path="/professor/courses/new" element={<CreateCourse />} />
            <Route path="/professor/courses/:courseId" element={<CourseDetail />} />

            {/* Student routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/invitations" element={<StudentInvitations />} />
            <Route path="/student/courses" element={<StudentCourses />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
