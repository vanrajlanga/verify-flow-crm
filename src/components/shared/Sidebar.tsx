
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User } from '@/utils/mockData';
import { BadgeCheck, BarChart, File, Home, List, Settings, User as UserIcon, Users } from 'lucide-react';

interface SidebarProps {
  user: User;
  isOpen: boolean;
}

const Sidebar = ({ user, isOpen }: SidebarProps) => {
  const [activeGroup, setActiveGroup] = useState<string | null>('dashboard');

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  const adminLinks = [
    { group: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', path: '/admin' },
    { group: 'leads', icon: <List size={20} />, label: 'Lead Management', path: '/admin/leads' },
    { group: 'verifications', icon: <BadgeCheck size={20} />, label: 'Verifications', path: '/admin/verifications' },
    { group: 'reports', icon: <BarChart size={20} />, label: 'Reports', path: '/admin/reports' },
    { group: 'agents', icon: <Users size={20} />, label: 'Agent Management', path: '/admin/agents' },
    { group: 'banks', icon: <File size={20} />, label: 'Bank Integration', path: '/admin/banks' },
    { group: 'settings', icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  const agentLinks = [
    { group: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', path: '/agent' },
    { group: 'leads', icon: <List size={20} />, label: 'My Leads', path: '/agent/leads' },
    { group: 'history', icon: <File size={20} />, label: 'History', path: '/agent/history' },
    { group: 'profile', icon: <UserIcon size={20} />, label: 'My Profile', path: '/agent/profile' },
  ];

  const links = user.role === 'admin' ? adminLinks : agentLinks;

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-gray-200 dark:border-gray-800 shadow-sm transition-transform duration-300 md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-medium text-sidebar-foreground flex items-center">
            <span className="bg-sidebar-primary text-sidebar-primary-foreground rounded-md p-1 mr-2 text-xs">
              KYC
            </span>
            Bank Verification CRM
          </h2>
          <p className="text-sm text-sidebar-foreground/70 mt-1">
            {user.role === 'admin' ? 'Administrator Panel' : `Agent Panel - ${user.district}`}
          </p>
        </div>
        
        <div className="mt-6 flex flex-col flex-1 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              onClick={() => toggleGroup(link.group)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-auto px-4 py-2">
          <div className="rounded-md bg-sidebar-accent/50 p-4 text-xs text-sidebar-foreground">
            <p className="font-medium">Need help?</p>
            <p className="mt-1">Contact support team</p>
            <p className="font-medium mt-2">support@bankkyc.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
