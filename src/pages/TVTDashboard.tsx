
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Lead } from '@/utils/mockData';
import { getUserById, getBankById } from '@/lib/supabase-queries';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { format } from 'date-fns';
import { Eye, Phone } from 'lucide-react';

const TVTDashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bankNames, setBankNames] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has TVT role
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'tvt') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    
    const fetchLeads = async () => {
      // Get all leads from localStorage or use mockLeads
      const storedLeads = localStorage.getItem('mockLeads');
      let allLeads = [];
      
      if (storedLeads) {
        try {
          allLeads = JSON.parse(storedLeads);
        } catch (error) {
          console.error("Error parsing stored leads:", error);
          const { mockLeads } = await import('@/utils/mockData');
          allLeads = mockLeads;
        }
      } else {
        const { mockLeads } = await import('@/utils/mockData');
        allLeads = mockLeads;
      }
      
      setLeads(allLeads);
      
      // Fetch bank names for all leads
      const bankNamesMap: {[key: string]: string} = {};
      for (const lead of allLeads) {
        if (lead.bank && !bankNamesMap[lead.bank]) {
          try {
            const bank = await getBankById(lead.bank);
            bankNamesMap[lead.bank] = bank?.name || 'Unknown Bank';
          } catch (error) {
            console.error('Error fetching bank:', error);
            bankNamesMap[lead.bank] = 'Unknown Bank';
          }
        }
      }
      setBankNames(bankNamesMap);
    };
    
    fetchLeads();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: leads.length,
    pending: leads.filter(lead => lead.status === 'Pending').length,
    inProgress: leads.filter(lead => lead.status === 'In Progress').length,
    completed: leads.filter(lead => lead.status === 'Completed').length,
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">TVT Dashboard</h1>
                <p className="text-muted-foreground">
                  Televerification team - Call and verify customer details
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Leads Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>
                  Click on any lead to start televerification process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Lead Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No leads found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.additionalDetails?.phoneNumber || 'N/A'}</TableCell>
                            <TableCell>{bankNames[lead.bank] || 'Unknown'}</TableCell>
                            <TableCell>{lead.additionalDetails?.leadType || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(lead.status)}</TableCell>
                            <TableCell>
                              {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/tvt/leads/${lead.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Verify
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TVTDashboard;
