
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Lead, User } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    inProgressLeads: 0,
    completedLeads: 0,
    totalAgents: 0,
    activeAgents: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load leads from localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      const leads: Lead[] = storedLeads ? JSON.parse(storedLeads) : [];
      
      // Load users from localStorage
      const storedUsers = localStorage.getItem('mockUsers');
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Calculate stats
      const totalLeads = leads.length;
      const pendingLeads = leads.filter(lead => lead.status === 'Pending').length;
      const inProgressLeads = leads.filter(lead => lead.status === 'In Progress').length;
      const completedLeads = leads.filter(lead => lead.status === 'Completed').length;
      
      const agents = users.filter(user => user.role === 'agent' || user.role === 'tvtteam');
      const totalAgents = agents.length;
      const activeAgents = agents.filter(agent => agent.status === 'Active').length;
      
      setDashboardStats({
        totalLeads,
        pendingLeads,
        inProgressLeads,
        completedLeads,
        totalAgents,
        activeAgents
      });
      
      // Get recent leads (last 5)
      const sortedLeads = leads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentLeads(sortedLeads);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of KYC verification system</p>
        </div>
        <Button onClick={() => navigate('/admin/leads/add')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">All verification requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingLeads}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.inProgressLeads}</div>
            <p className="text-xs text-muted-foreground">Currently being verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.completedLeads}</div>
            <p className="text-xs text-muted-foreground">Verification completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">Registered verification agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Available for assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground">No leads found</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{lead.name}</h4>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.bank} • {lead.address.city}, {lead.address.state}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={() => navigate('/admin/leads')}
        >
          <FileText className="h-6 w-6" />
          <span>Manage Leads</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={() => navigate('/admin/agents')}
        >
          <Users className="h-6 w-6" />
          <span>Manage Agents</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={() => navigate('/admin/reports')}
        >
          <FileText className="h-6 w-6" />
          <span>View Reports</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
