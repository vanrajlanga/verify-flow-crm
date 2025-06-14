
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/utils/mockData';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  FileText,
  Building2,
  Settings,
  BarChart3,
  CheckCircle,
  UserPlus,
  Briefcase,
  MapPin,
  CreditCard,
  FileSpreadsheet,
  User as UserIcon,
  Clock,
  Shield,
  Verified
} from 'lucide-react';

interface SidebarProps {
  user: User;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen }) => {
  const location = useLocation();

  const adminNavItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Leads', path: '/admin/leads' },
    { icon: UserPlus, label: 'Add Lead', path: '/admin/add-lead' },
    { icon: FileSpreadsheet, label: 'Leads Sheet', path: '/admin/leads-sheet' },
    { icon: Users, label: 'Agents', path: '/admin/agents' },
    { icon: Building2, label: 'Banks', path: '/admin/banks' },
    { icon: Shield, label: 'Roles & Permissions', path: '/admin/roles' },
    { icon: CheckCircle, label: 'Verifications', path: '/admin/verifications' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: CreditCard, label: 'Bank Products', path: '/admin/bank-products' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const agentNavItems = [
    { icon: Home, label: 'Dashboard', path: '/agent' },
    { icon: FileText, label: 'My Leads', path: '/agent/leads' },
    { icon: UserIcon, label: 'Profile', path: '/agent/profile' },
    { icon: Clock, label: 'History', path: '/agent/history' },
  ];

  const tvtNavItems = [
    { icon: Home, label: 'Dashboard', path: '/tvt/dashboard' },
    { icon: Verified, label: 'Assigned Leads', path: '/tvt/dashboard' },
  ];

  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return adminNavItems;
      case 'agent':
        return agentNavItems;
      case 'tvtteam': // Fix: Use 'tvtteam' instead of 'tvt'
        return tvtNavItems;
      case 'manager':
        return adminNavItems; // Managers use same nav as admin but with restricted access
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={cn(
      "bg-card border-r border-border h-screen transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4">
        <h2 className={cn(
          "font-bold text-lg text-foreground transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          {user.role === 'admin' ? 'Admin Panel' : 
           user.role === 'agent' ? 'Agent Panel' : 
           user.role === 'tvtteam' ? 'TVT Panel' : // Fix: Use 'tvtteam' instead of 'tvt'
           user.role === 'manager' ? 'Manager Panel' : 'Dashboard'}
        </h2>
      </div>
      
      <nav className="mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                !isOpen && "justify-center"
              )}
            >
              <Icon className="h-5 w-5" />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
