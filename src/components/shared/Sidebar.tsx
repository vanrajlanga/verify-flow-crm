
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  UserCheck,
  Building,
  Briefcase,
  Shield,
  UserCog,
  Building2,
  CheckCircle
} from 'lucide-react';
import { User } from '@/utils/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  user: User;
  isOpen: boolean;
}

const Sidebar = ({ user, isOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isAdmin = user.role === 'admin';

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: isAdmin ? '/admin' : '/agent',
      adminOnly: false
    },
    {
      icon: FileText,
      label: 'Leads',
      path: isAdmin ? '/admin/leads' : '/agent/leads',
      adminOnly: false
    },
    {
      icon: CheckCircle,
      label: 'Verifications',
      path: '/admin/verifications',
      adminOnly: true
    },
    {
      icon: Users,
      label: 'Agents',
      path: '/admin/agents',
      adminOnly: true
    },
    {
      icon: BarChart,
      label: 'Reports',
      path: '/admin/reports',
      adminOnly: true
    },
    {
      icon: Building2,
      label: 'Bank Integration',
      path: '/admin/banks',
      adminOnly: true
    },
    {
      icon: Shield,
      label: 'Roles & Permissions',
      path: '/admin/roles',
      adminOnly: true
    }
  ];

  const settingsItems = [
    {
      icon: Building,
      label: 'Bank Branches',
      path: '/admin/settings?tab=bank-branches',
      adminOnly: true
    },
    {
      icon: Briefcase,
      label: 'Lead Types',
      path: '/admin/settings?tab=lead-types',
      adminOnly: true
    },
    {
      icon: UserCheck,
      label: 'Vehicle Brands',
      path: '/admin/settings?tab=vehicles',
      adminOnly: true
    },
    {
      icon: Settings,
      label: 'System',
      path: '/admin/settings?tab=system',
      adminOnly: true
    },
    {
      icon: UserCog,
      label: 'Email',
      path: '/admin/settings?tab=email',
      adminOnly: true
    },
    {
      icon: Shield,
      label: 'Security',
      path: '/admin/settings?tab=security',
      adminOnly: true
    },
    {
      icon: Users,
      label: 'Account',
      path: '/admin/settings?tab=account',
      adminOnly: true
    }
  ];

  const isActiveRoute = (path: string) => {
    if (path.includes('?tab=')) {
      const [basePath, tab] = path.split('?tab=');
      return location.pathname === basePath && location.search.includes(tab);
    }
    return location.pathname === path;
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center px-4 border-b">
        <h2 className="text-lg font-semibold">KYC Portal</h2>
        <Badge variant="secondary" className="ml-2">
          {user.role}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMenuClick(item.path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}

          {isAdmin && (
            <>
              <Separator className="my-4" />
              
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                    {settingsOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6">
                  {settingsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleMenuClick(item.path)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
