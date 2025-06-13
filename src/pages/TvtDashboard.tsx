
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getLeadsFromDatabase } from '@/lib/lead-operations';

const TvtDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'tvtteam') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadAssignedLeads(parsedUser.id);
  }, [navigate]);

  const loadAssignedLeads = async (userId: string) => {
    try {
      // Load leads from database
      const allLeads = await getLeadsFromDatabase();
      const userLeads = allLeads.filter(lead => lead.assignedTo === userId);
      
      if (userLeads.length === 0) {
        // Fallback to localStorage
        const storedLeads = localStorage.getItem('mockLeads');
        if (storedLeads) {
          const leads = JSON.parse(storedLeads);
          const filteredLeads = leads.filter((lead: Lead) => lead.assignedTo === userId);
          setAssignedLeads(filteredLeads);
          calculateStats(filteredLeads);
        }
      } else {
        setAssignedLeads(userLeads);
        calculateStats(userLeads);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const calculateStats = (leads: Lead[]) => {
    const stats = {
      total: leads.length,
      pending: leads.filter(lead => lead.status === 'Pending').length,
      inProgress: leads.filter(lead => lead.status === 'In Progress').length,
      completed: leads.filter(lead => lead.status === 'Completed').length
    };
    setStats(stats);
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/tvt/leads/${leadId}`);
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={currentUser} isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TVT Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {currentUser.name}. Here are your assigned leads for verification.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Leads</CardTitle>
                <CardDescription>
                  Leads assigned to you for verification and data validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignedLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No leads assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{lead.name}</h3>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <Badge variant="outline">
                              {lead.visitType}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Agency File: {lead.additionalDetails?.agencyFileNo || 'N/A'}</p>
                            <p>Application ID: {lead.additionalDetails?.applicationBarcode || lead.id}</p>
                            <p>Product: {lead.additionalDetails?.leadType || 'N/A'}</p>
                            <p>Address: {lead.address?.street}, {lead.address?.city}</p>
                          </div>
                        </div>
                        <Button onClick={() => handleViewLead(lead.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Verify Data
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtDashboard;
