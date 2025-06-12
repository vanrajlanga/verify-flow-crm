import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCheck,
  Plus,
  History,
  User,
  Shield,
  Phone
} from 'lucide-react';

interface SidebarProps {
  user: any;
  isOpen: boolean;
}

const Sidebar = ({ user, isOpen }: SidebarProps) => {
  const location = useLocation();

  const getMenuItems = () => {
    if (user.role === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: FileText, label: 'Leads', href: '/admin/leads' },
        { icon: Users, label: 'Agents', href: '/admin/agents' },
        { icon: Building2, label: 'Banks', href: '/admin/banks' },
        { icon: UserCheck, label: 'Verifications', href: '/admin/verifications' },
        { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
        { icon: Shield, label: 'Roles', href: '/admin/roles' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ];
    } else if (user.role === 'agent') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
        { icon: FileText, label: 'My Leads', href: '/agent/leads' },
        { icon: History, label: 'History', href: '/agent/history' },
        { icon: User, label: 'Profile', href: '/agent/profile' },
      ];
    } else if (user.role === 'tvt') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/tvt' },
        { icon: Phone, label: 'Televerification', href: '/tvt' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">K</span>
          </div>
          {isOpen && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900">KYC System</h2>
              <p className="text-xs text-gray-500 capitalize">{user.role} Panel</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
