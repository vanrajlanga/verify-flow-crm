import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { DataTableViewOptions } from "@/components/admin/data-table-view-options"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "@/components/admin/agent-table/columns"
import { supabase } from '@/integrations/supabase/client';
import { transformSupabaseUser } from '@/lib/data-transformers';
import { toast } from "@/components/ui/use-toast"

const AdminAgents = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadAgents();
  }, [navigate]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      // Try to get agents from database first
      const { data: dbAgents, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'agent');

      if (!error && dbAgents && dbAgents.length > 0) {
        const transformedAgents = dbAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          password: agent.password || 'default123', // Add default password
          role: agent.role,
          phone: agent.phone || '',
          status: agent.status || 'Active',
          state: agent.state,
          district: agent.district || '',
          city: agent.city,
          totalVerifications: agent.total_verifications || 0,
          completionRate: agent.completion_rate || 0
        }));
        setAgents(transformedAgents);
        return;
      }
    } catch (error) {
      console.error('Error loading agents from database:', error);
      toast({
        title: "Error",
        description: "Failed to load agents from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }

    // Fall back to localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const filteredAgents = parsedUsers.filter((user: User) => user.role === 'agent');
        setAgents(filteredAgents);
      } catch (error) {
        console.error("Error parsing stored users:", error);
        toast({
          title: "Error",
          description: "Failed to load agents from localStorage.",
          variant: "destructive"
        });
        setAgents([]);
      }
    } else {
      setAgents([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
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
          <div className="container mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Agents</h1>
              <DataTableViewOptions table={null} />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <p>Loading agents...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <DataTable columns={columns} data={agents} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAgents;
