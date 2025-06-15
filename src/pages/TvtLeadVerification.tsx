
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Lead, User as UserType } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import LeadVerificationTable from '@/components/tvt/LeadVerificationTable';
import { getLeadByIdFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';
import { toast } from '@/components/ui/use-toast';

interface FieldVerification {
  fieldName: string;
  originalValue: string;
  verifiedValue: string;
  isVerified: boolean;
  isCorrect: boolean;
  notes: string;
}

const TvtLeadVerification = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    
    if (leadId) {
      loadLeadDetail(leadId);
    }
  }, [navigate, leadId]);

  const loadLeadDetail = async (id: string) => {
    try {
      setLoading(true);
      console.log('TVT Verification: Loading lead detail for ID:', id);
      
      const leadData = await getLeadByIdFromDatabase(id);
      
      if (leadData) {
        setLead(leadData);
        console.log('TVT Verification: Lead detail loaded successfully:', leadData.name);
      } else {
        console.log('TVT Verification: No lead found with ID:', id);
        toast({
          title: "Lead not found",
          description: `No lead found with ID: ${id}`,
          variant: "destructive"
        });
        navigate('/tvt/dashboard');
      }
    } catch (error) {
      console.error('TVT Verification: Error loading lead detail:', error);
      toast({
        title: "Error loading lead",
        description: "Failed to load lead details. Please try again.",
        variant: "destructive"
      });
      navigate('/tvt/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVerification = async (verificationData: FieldVerification[]) => {
    if (!lead || !currentUser) return;

    try {
      setSaving(true);
      console.log('Saving verification data:', verificationData);

      const updatedLead = {
        ...lead,
        status: 'In Progress' as const,
        verification: {
          verificationData,
          verifiedBy: currentUser.name,
          verifiedAt: new Date(),
          status: 'In Progress' as const
        }
      };

      await updateLeadInDatabase(lead.id, updatedLead);
      setLead(updatedLead);

      toast({
        title: "Verification saved",
        description: "Lead verification data has been saved successfully.",
      });

    } catch (error) {
      console.error('Error saving verification:', error);
      toast({
        title: "Error saving verification",
        description: "Failed to save verification data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (loading) {
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Loading Lead for Verification...</h2>
                <p className="text-muted-foreground">Please wait while we fetch the lead information.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!lead) {
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Lead Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested lead could not be found.</p>
                <Button onClick={() => navigate('/tvt/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
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
          <div className="max-w-full mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/tvt/dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Verify Lead: {lead.name}</h1>
                  <p className="text-muted-foreground">Lead ID: {lead.id} | Bank: {lead.bank}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Verifying as: {currentUser.name}</span>
              </div>
            </div>

            {/* Verification Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How to verify lead data:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Call the applicant using the provided phone number: <strong>{lead.phone}</strong></li>
                    <li>• Verify each field by asking the applicant to confirm or provide the correct information</li>
                    <li>• Enter the verified data in the "Verified Data" column</li>
                    <li>• Mark each field as "Verified" and then as "Correct" or "Incorrect"</li>
                    <li>• Add notes for any discrepancies or important observations</li>
                    <li>• Review all uploaded documents to ensure they match the provided information</li>
                    <li>• Save your verification progress regularly using the save button</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Verification Table */}
            <LeadVerificationTable 
              lead={lead} 
              onSave={handleSaveVerification}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtLeadVerification;
