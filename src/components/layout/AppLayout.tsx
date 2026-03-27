import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, LayoutDashboard, Mail, GraduationCap } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, roles, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isProfessor = roles.includes('professor');

  const navItems = isProfessor
    ? [
        { href: '/professor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/professor/courses', label: 'Courses', icon: BookOpen },
      ]
    : [
        { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/student/invitations', label: 'Invitations', icon: Mail },
        { href: '/student/courses', label: 'My Courses', icon: BookOpen },
      ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to={isProfessor ? '/professor' : '/student'} className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl tracking-tight text-foreground">Origyn</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/professor' && item.href !== '/student' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right text-sm md:block">
              <p className="font-medium text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
