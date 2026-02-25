import { ReactNode, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageBreadcrumb } from './PageBreadcrumb';
import { BreadcrumbItem } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsDropdown } from './NotificationsDropdown';
import { NavigationHistoryDropdown } from './NavigationHistoryDropdown';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsBelowLg } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Duplicar SidebarContent para evitar import circular
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  ClipboardCheck,
  Users,
  Settings,
  LogOut,
  
  FileSearch,
  BarChart3,
  Headphones,
} from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import logoVistto from '@/assets/logo_vistto.png';

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'employee'] },
  { title: 'Veículos', icon: Car, href: '/vehicles', roles: ['admin'] },
  { title: 'Vistorias', icon: ClipboardCheck, href: '/inspections', roles: ['admin', 'employee'] },
  { title: 'Realizar Vistoria', icon: FileSearch, href: '/new-inspection', roles: ['employee'] },
  { title: 'Relatórios', icon: BarChart3, href: '/reports', roles: ['admin'] },
  { title: 'Usuários', icon: Users, href: '/users', roles: ['admin'] },
  { title: 'Assistência', icon: Headphones, href: '/assistance', roles: ['admin'] },
  { title: 'Configurações', icon: Settings, href: '/settings', roles: ['admin', 'employee'] },
];

function MobileSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img src={logoVistto} alt="Vistto" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">Vistto</h1>
          <p className="text-xs text-sidebar-foreground/60">Proteção Veicular</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-sm">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const isBelowLg = useIsBelowLg();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Don't show breadcrumbs on dashboard (it's the root)
  const showBreadcrumbs = location.pathname !== '/dashboard';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - only on lg+ */}
      {!isBelowLg && <AppSidebar />}
      
      {/* Main Content */}
      <div className="transition-all duration-200 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile/Tablet Menu Button */}
            {isBelowLg && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 border-r border-sidebar-border">
                  <MobileSidebarContent onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
            <div className="flex flex-col gap-0.5">
              {showBreadcrumbs && (
                <PageBreadcrumb customBreadcrumbs={breadcrumbs} />
              )}
              {title && !showBreadcrumbs && (
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                  {title}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <NavigationHistoryDropdown />
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
