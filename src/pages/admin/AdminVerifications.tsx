
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, mockLeads, getUserById } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

const AdminVerifications = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  // Filter leads with verification data
  const verificationLeads = mockLeads.filter(lead => lead.verification);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Not Started':
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
                <h1 className="text-2xl font-bold tracking-tight">Verifications</h1>
                <p className="text-muted-foreground">
                  Review and manage verification submissions
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Verifications</CardTitle>
                <CardDescription>
                  List of all verification submissions by agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Completion Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No verifications found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        verificationLeads.map((lead) => {
                          const agent = getUserById(lead.assignedTo);
                          const verification = lead.verification!;
                          
                          return (
                            <TableRow key={verification.id}>
                              <TableCell className="font-medium">{lead.name}</TableCell>
                              <TableCell>{agent?.name || 'Unknown'}</TableCell>
                              <TableCell>
                                {verification.startTime 
                                  ? format(verification.startTime, 'MMM d, yyyy h:mm a')
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                {verification.completionTime
                                  ? format(verification.completionTime, 'MMM d, yyyy h:mm a')
                                  : '—'}
                              </TableCell>
                              <TableCell>{getStatusBadge(verification.status)}</TableCell>
                              <TableCell>
                                {verification.reviewedBy 
                                  ? (verification.status === 'Rejected' 
                                    ? <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                                    : <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>)
                                  : <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Pending Review</Badge>}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => navigate(`/admin/leads/${lead.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
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

export default AdminVerifications;
