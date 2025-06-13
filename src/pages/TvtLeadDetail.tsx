
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Lead } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { toast } from '@/components/ui/use-toast';
import { Save, Check, X, ArrowLeft } from 'lucide-react';
import { getLeadsFromDatabase, updateLeadInDatabase } from '@/lib/lead-operations';

interface VerificationData {
  [key: string]: {
    verified: boolean;
    verifiedValue: string;
    notes: string;
  };
}

const TvtLeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData>({});
  const [isSaving, setIsSaving] = useState(false);

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
    loadLead();
  }, [navigate, leadId]);

  const loadLead = async () => {
    try {
      // Load from database first
      const allLeads = await getLeadsFromDatabase();
      const foundLead = allLeads.find(l => l.id === leadId);
      
      if (foundLead) {
        setLead(foundLead);
        initializeVerificationData(foundLead);
      } else {
        // Fallback to localStorage
        const storedLeads = localStorage.getItem('mockLeads');
        if (storedLeads) {
          const leads = JSON.parse(storedLeads);
          const foundLead = leads.find((l: Lead) => l.id === leadId);
          if (foundLead) {
            setLead(foundLead);
            initializeVerificationData(foundLead);
          } else {
            navigate('/tvt/dashboard');
          }
        } else {
          navigate('/tvt/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      navigate('/tvt/dashboard');
    }
  };

  const initializeVerificationData = (lead: Lead) => {
    const fields = [
      'name', 'age', 'job', 'phoneNumber', 'email', 'dateOfBirth',
      'company', 'designation', 'workExperience', 'monthlyIncome', 'annualIncome',
      'residenceAddress', 'officeAddress', 'permanentAddress',
      'loanAmount', 'loanType', 'vehicleBrand', 'vehicleModel'
    ];

    const initialData: VerificationData = {};
    fields.forEach(field => {
      initialData[field] = {
        verified: false,
        verifiedValue: '',
        notes: ''
      };
    });

    setVerificationData(initialData);
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
  };

  const handleVerificationChange = (field: string, type: 'verified' | 'verifiedValue' | 'notes', value: any) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value
      }
    }));
  };

  const handleSaveVerification = async () => {
    if (!lead) return;

    setIsSaving(true);
    try {
      // Update the lead with verification data
      const updatedLead = {
        ...lead,
        verification: {
          ...lead.verification,
          status: 'In Progress' as const,
          notes: JSON.stringify(verificationData),
          agentId: currentUser?.id || '',
          startTime: new Date(),
        }
      };

      // Save to database
      await updateLeadInDatabase(lead.id, updatedLead);
      
      // Also update localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const updatedLeads = leads.map((l: Lead) => 
          l.id === lead.id ? updatedLead : l
        );
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      }

      toast({
        title: "Verification Saved",
        description: "Lead verification data has been saved successfully.",
      });

      setLead(updatedLead);
    } catch (error) {
      console.error('Error saving verification:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save verification data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldValue = (field: string): string => {
    if (!lead) return '';
    
    switch (field) {
      case 'name': return lead.name;
      case 'age': return lead.age?.toString() || '';
      case 'job': return lead.job || '';
      case 'phoneNumber': return lead.additionalDetails?.phoneNumber || '';
      case 'email': return lead.additionalDetails?.email || '';
      case 'dateOfBirth': return lead.additionalDetails?.dateOfBirth || '';
      case 'company': return lead.additionalDetails?.company || '';
      case 'designation': return lead.additionalDetails?.designation || '';
      case 'workExperience': return lead.additionalDetails?.workExperience || '';
      case 'monthlyIncome': return lead.additionalDetails?.monthlyIncome || '';
      case 'annualIncome': return lead.additionalDetails?.annualIncome || '';
      case 'loanAmount': return lead.additionalDetails?.loanAmount || '';
      case 'loanType': return lead.additionalDetails?.loanType || '';
      case 'vehicleBrand': return lead.additionalDetails?.vehicleBrandName || '';
      case 'vehicleModel': return lead.additionalDetails?.vehicleModelName || '';
      case 'residenceAddress': 
        return `${lead.address?.street || ''}, ${lead.address?.city || ''}, ${lead.address?.state || ''} - ${lead.address?.pincode || ''}`;
      case 'officeAddress':
        const officeAddr = lead.additionalDetails?.addresses?.find(addr => addr.type === 'Office');
        return officeAddr ? `${officeAddr.street}, ${officeAddr.city}, ${officeAddr.state} - ${officeAddr.pincode}` : '';
      case 'permanentAddress':
        const permAddr = lead.additionalDetails?.addresses?.find(addr => addr.type === 'Permanent');
        return permAddr ? `${permAddr.street}, ${permAddr.city}, ${permAddr.state} - ${permAddr.pincode}` : '';
      default: return '';
    }
  };

  const renderVerificationField = (label: string, field: string) => {
    const originalValue = getFieldValue(field);
    const verification = verificationData[field] || { verified: false, verifiedValue: '', notes: '' };

    return (
      <div className="grid grid-cols-2 gap-6 p-4 border rounded-lg">
        {/* Original Data Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{label}</h4>
            <Badge variant="outline">Original</Badge>
          </div>
          <div className="p-3 bg-muted/50 rounded border">
            <p className="text-sm">{originalValue || 'N/A'}</p>
          </div>
        </div>

        {/* Verification Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Verified Data</h4>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={verification.verified}
                onCheckedChange={(checked) => 
                  handleVerificationChange(field, 'verified', !!checked)
                }
              />
              <span className="text-xs">
                {verification.verified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <X className="h-3 w-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </span>
            </div>
          </div>
          
          <Input
            placeholder="Enter verified value"
            value={verification.verifiedValue}
            onChange={(e) => 
              handleVerificationChange(field, 'verifiedValue', e.target.value)
            }
          />
          
          <Textarea
            placeholder="Add verification notes"
            value={verification.notes}
            onChange={(e) => 
              handleVerificationChange(field, 'notes', e.target.value)
            }
            rows={2}
          />
        </div>
      </div>
    );
  };

  if (!currentUser || !lead) {
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
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/tvt/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Lead Verification</h1>
                <p className="text-muted-foreground">
                  Verify and validate lead data for {lead.name}
                </p>
              </div>
              <div className="ml-auto">
                <Button onClick={handleSaveVerification} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Verification'}
                </Button>
              </div>
            </div>

            {/* Lead Information Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lead Information</span>
                  <div className="flex gap-2">
                    <Badge>{lead.status}</Badge>
                    <Badge variant="outline">{lead.visitType}</Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Application ID: {lead.additionalDetails?.applicationBarcode || lead.id} | 
                  Agency File: {lead.additionalDetails?.agencyFileNo || 'N/A'}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderVerificationField('Full Name', 'name')}
                {renderVerificationField('Age', 'age')}
                {renderVerificationField('Job/Occupation', 'job')}
                {renderVerificationField('Phone Number', 'phoneNumber')}
                {renderVerificationField('Email Address', 'email')}
                {renderVerificationField('Date of Birth', 'dateOfBirth')}
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderVerificationField('Company Name', 'company')}
                {renderVerificationField('Designation', 'designation')}
                {renderVerificationField('Work Experience', 'workExperience')}
                {renderVerificationField('Monthly Income', 'monthlyIncome')}
                {renderVerificationField('Annual Income', 'annualIncome')}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderVerificationField('Residence Address', 'residenceAddress')}
                {renderVerificationField('Office Address', 'officeAddress')}
                {renderVerificationField('Permanent Address', 'permanentAddress')}
              </CardContent>
            </Card>

            {/* Loan/Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Loan/Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderVerificationField('Loan Amount', 'loanAmount')}
                {renderVerificationField('Loan Type', 'loanType')}
                {renderVerificationField('Vehicle Brand', 'vehicleBrand')}
                {renderVerificationField('Vehicle Model', 'vehicleModel')}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveVerification} disabled={isSaving} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving Verification...' : 'Save All Verification Data'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtLeadDetail;
