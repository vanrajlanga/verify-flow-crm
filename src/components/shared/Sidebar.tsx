import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Building2, 
  UserCheck, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  UserPlus,
  FileSpreadsheet,
  List
} from 'lucide-react';

interface SidebarProps {
  user: User;
  isOpen: boolean;
}

const Sidebar = ({ user, isOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: List, label: 'Lead List', path: '/admin/leads' },
    { icon: FileSpreadsheet, label: 'Lead Sheet', path: '/admin/leads-sheet' },
    { icon: Users, label: 'Agents', path: '/admin/agents' },
    { icon: Building2, label: 'Banks', path: '/admin/banks' },
    { icon: Building2, label: 'Bank & Product', path: '/admin/bank-product' },
    { icon: UserCheck, label: 'Verifications', path: '/admin/verifications' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const agentMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/agent/dashboard' },
    { icon: FileText, label: 'My Leads', path: '/agent/leads' },
    { icon: Calendar, label: 'History', path: '/agent/history' },
    { icon: Clock, label: 'Profile', path: '/agent/profile' },
  ];

  const inhouseTeamMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/agent/dashboard' },
    { icon: FileText, label: 'My Leads', path: '/agent/leads' },
    { icon: Calendar, label: 'History', path: '/agent/history' },
    { icon: Clock, label: 'Profile', path: '/agent/profile' },
  ];

  const getMenuItems = () => {
    switch (user.role) {
      case 'admin':
        return adminMenuItems;
      case 'agent':
        return agentMenuItems;
      case 'Inhouse Team':
        return inhouseTeamMenuItems;
      default:
        return agentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    } flex flex-col h-screen`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">KYC System</h2>
              <p className="text-sm text-gray-500">Verification Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {(user.role === 'agent' || user.role === 'Inhouse Team') && user.district && (
                  <Badge variant="outline" className="text-xs">
                    {user.district}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start ${!isOpen ? 'px-2' : ''} ${
                    active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Agent Stats */}
      {(user.role === 'agent' || user.role === 'Inhouse Team') && isOpen && (
        <div className="p-4 border-t border-gray-200">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {user.totalVerifications || 0}
                </div>
                <div className="text-xs text-gray-500">Total Verifications</div>
                <div className="mt-2">
                  <div className="text-sm font-medium text-green-600">
                    {user.completionRate || 0}% Success Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
