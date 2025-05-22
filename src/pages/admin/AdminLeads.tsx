
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lead, User, Bank, mockLeads, mockUsers, mockBanks } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { MoreVertical, Edit, Trash, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AddLeadForm from '@/components/admin/AddLeadForm';
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Define LocationData interface since it's missing
interface LocationData {
  states: Array<{
    id: string;
    name: string;
    districts: Array<{
      id: string;
      name: string;
      cities: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
  cities: Record<string, string>;
}

const AdminLeads = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast()

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
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get leads from localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
      } else {
        // If no leads in localStorage, use mock data
        setLeads(mockLeads);
        localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
      }

      // Get location data from localStorage
      const storedLocationData = localStorage.getItem('locationData');
      if (storedLocationData) {
        const parsedLocationData = JSON.parse(storedLocationData);
        setLocationData(parsedLocationData);
      } else {
        // Default location data structure if none exists
        const defaultLocationData = {
          states: [],
          cities: {}
        };
        setLocationData(defaultLocationData);
        localStorage.setItem('locationData', JSON.stringify(defaultLocationData));
      }

      // Get agents from localStorage
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        const agentUsers = parsedUsers.filter((user: User) => user.role === 'agent');
        setAgents(agentUsers);
      } else {
        // If no users in localStorage, use mock data
        const agentUsers = mockUsers.filter(user => user.role === 'agent');
        setAgents(agentUsers);
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }

      // Get banks from localStorage
      const storedBanks = localStorage.getItem('mockBanks');
      if (storedBanks) {
        const parsedBanks = JSON.parse(storedBanks);
        setBanks(parsedBanks);
      } else {
        // If no banks in localStorage, use mock data
        setBanks(mockBanks);
        localStorage.setItem('mockBanks', JSON.stringify(mockBanks));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads([...leads, newLead]);
    setShowAddLeadForm(false);
    toast({
      title: "Success",
      description: "Lead added successfully.",
    })
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(leads.filter(lead => lead.id !== leadId));
    toast({
      title: "Success",
      description: "Lead deleted successfully.",
    })
  };

  const renderLeadStatusBadge = (status: string) => {
    let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "secondary";
    if (status === 'Pending') {
      badgeVariant = "secondary";
    } else if (status === 'In Progress') {
      badgeVariant = "secondary";
    } else if (status === 'Completed') {
      badgeVariant = "secondary";
    } else if (status === 'Rejected') {
      badgeVariant = "secondary";
    }

    return (
      <Badge variant={badgeVariant}>
        {status}
      </Badge>
    );
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
            <div className="flex items-center justify-between space-y-2 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
                <p className="text-muted-foreground">
                  Manage and review lead applications
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Input placeholder="Search leads..." type="search" className="max-w-md" />
                <Button onClick={() => setShowAddLeadForm(true)}>Add Lead</Button>
              </div>
            </div>

            {showAddLeadForm && locationData && (
              <AddLeadForm
                onAddLead={handleAddLead}
                onClose={() => setShowAddLeadForm(false)}
                locationData={locationData}
                agents={agents}
                banks={banks}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Lead Applications</CardTitle>
                <CardDescription>
                  View all lead applications and their current status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leads.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.address?.city || 'N/A'}</TableCell>
                            <TableCell>{lead.bank || 'N/A'}</TableCell>
                            <TableCell>{lead.address?.city || lead.address?.state || 'N/A'}</TableCell>
                            <TableCell>{renderLeadStatusBadge(lead.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No Leads Found</AlertTitle>
                    <AlertDescription>
                      There are currently no leads to display. Add a new lead to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLeads;
