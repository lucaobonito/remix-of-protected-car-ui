import {
  LayoutDashboard,
  Car,
  ClipboardCheck,
  FileSearch,
  BarChart3,
  Trophy,
  Users,
  Settings,
  ScrollText,
  Kanban,
} from 'lucide-react';

export interface RouteConfig {
  title: string;
  parent: string | null;
  icon: React.ElementType;
}

export const routeConfig: Record<string, RouteConfig> = {
  '/dashboard': {
    title: 'Dashboard',
    parent: null,
    icon: LayoutDashboard,
  },
  '/vehicles': {
    title: 'Veículos',
    parent: '/dashboard',
    icon: Car,
  },
  '/inspections': {
    title: 'Vistorias',
    parent: '/dashboard',
    icon: ClipboardCheck,
  },
  '/new-inspection': {
    title: 'Nova Vistoria',
    parent: '/inspections',
    icon: FileSearch,
  },
  '/kanban': {
    title: 'Kanban',
    parent: '/inspections',
    icon: Kanban,
  },
  '/reports': {
    title: 'Relatórios',
    parent: '/dashboard',
    icon: BarChart3,
  },
  '/rankings': {
    title: 'Rankings',
    parent: '/reports',
    icon: Trophy,
  },
  '/users': {
    title: 'Usuários',
    parent: '/dashboard',
    icon: Users,
  },
  '/settings': {
    title: 'Configurações',
    parent: '/dashboard',
    icon: Settings,
  },
  '/audit': {
    title: 'Logs de Auditoria',
    parent: '/dashboard',
    icon: ScrollText,
  },
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath: string | null = pathname;

  // Build breadcrumb chain from current route up to root
  while (currentPath) {
    const config = routeConfig[currentPath];
    if (config) {
      breadcrumbs.unshift({
        label: config.title,
        href: currentPath === pathname ? undefined : currentPath,
      });
      currentPath = config.parent;
    } else {
      break;
    }
  }

  return breadcrumbs;
}
