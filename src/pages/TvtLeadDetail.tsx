
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface VerificationField {
  fieldName: string;
  originalValue: string;
  verifiedValue: string;
  isCorrect: boolean | null;
  notes: string;
}

const TvtLeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [verificationFields, setVerificationFields] = useState<VerificationField[]>([]);

  useEffect(() => {
    // Check if user is logged in and has TVTTEAM role
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
    loadLeadData();
  }, [leadId, navigate]);

  const loadLeadData = () => {
    try {
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find((l: Lead) => l.id === leadId);
        if (foundLead) {
          setLead(foundLead);
          initializeVerificationFields(foundLead);
        } else {
          toast({
            title: "Lead not found",
            description: "The requested lead could not be found.",
            variant: "destructive"
          });
          navigate('/tvt');
        }
      }
    } catch (error) {
      console.error('Error loading lead data:', error);
      toast({
        title: "Error loading lead",
        description: "There was an error loading the lead data.",
        variant: "destructive"
      });
    }
  };

  const initializeVerificationFields = (leadData: Lead) => {
    const fields: VerificationField[] = [
      {
        fieldName: 'Customer Name',
        originalValue: leadData.name,
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Age',
        originalValue: leadData.age?.toString() || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Job/Designation',
        originalValue: leadData.job || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Phone Number',
        originalValue: leadData.additionalDetails?.phoneNumber || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Email',
        originalValue: leadData.additionalDetails?.email || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Company',
        originalValue: leadData.additionalDetails?.company || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Designation',
        originalValue: leadData.additionalDetails?.designation || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Monthly Income',
        originalValue: leadData.additionalDetails?.monthlyIncome || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Annual Income',
        originalValue: leadData.additionalDetails?.annualIncome || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Property Type',
        originalValue: leadData.additionalDetails?.propertyType || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Ownership Status',
        originalValue: leadData.additionalDetails?.ownershipStatus || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Residence Address',
        originalValue: `${leadData.address?.street || ''}, ${leadData.address?.city || ''}, ${leadData.address?.district || ''}, ${leadData.address?.state || ''} - ${leadData.address?.pincode || ''}`,
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      }
    ];

    // Add co-applicant fields if exists
    if (leadData.additionalDetails?.coApplicant) {
      fields.push({
        fieldName: 'Co-Applicant Name',
        originalValue: leadData.additionalDetails.coApplicant.name || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      });
      fields.push({
        fieldName: 'Co-Applicant Phone',
        originalValue: leadData.additionalDetails.coApplicant.phone || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      });
    }

    setVerificationFields(fields);
  };

  const updateVerificationField = (index: number, field: keyof VerificationField, value: string | boolean | null) => {
    const updatedFields = [...verificationFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setVerificationFields(updatedFields);
  };

  const handleSaveVerification = () => {
    try {
      // Save verification data to localStorage
      const verificationData = {
        leadId,
        verificationFields,
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.id
      };

      const existingVerifications = localStorage.getItem('leadVerifications') || '[]';
      const verifications = JSON.parse(existingVerifications);
      
      // Remove existing verification for this lead if any
      const filteredVerifications = verifications.filter((v: any) => v.leadId !== leadId);
      filteredVerifications.push(verificationData);
      
      localStorage.setItem('leadVerifications', JSON.stringify(filteredVerifications));

      toast({
        title: "Verification Saved",
        description: "Lead verification data has been saved successfully.",
      });

      navigate('/tvt');
    } catch (error) {
      console.error('Error saving verification:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the verification data.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kycUser');
    navigate('/');
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/tvt')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Lead Verification</h1>
                  <p className="text-muted-foreground">
                    Verify lead data for: {lead.name}
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveVerification} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Verification
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Original Lead Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Agency File No:</span>
                      <p className="text-sm">{lead.additionalDetails?.agencyFileNo || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Application ID:</span>
                      <p className="text-sm">{lead.additionalDetails?.applicationBarcode || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {verificationFields.map((field, index) => (
                      <div key={field.fieldName} className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {field.fieldName}:
                        </label>
                        <p className="text-sm bg-muted p-2 rounded border">
                          {field.originalValue || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-green-600" />
                    Verified Data Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Enter verified data and mark if each field is correct or incorrect
                  </div>
                  <div className="space-y-4">
                    {verificationFields.map((field, index) => (
                      <div key={field.fieldName} className="space-y-2 p-3 border rounded-lg">
                        <label className="text-sm font-medium">
                          {field.fieldName}:
                        </label>
                        
                        <Input
                          placeholder="Enter verified value"
                          value={field.verifiedValue}
                          onChange={(e) => updateVerificationField(index, 'verifiedValue', e.target.value)}
                        />
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`correct-${index}`}
                              checked={field.isCorrect === true}
                              onCheckedChange={(checked) => 
                                updateVerificationField(index, 'isCorrect', checked ? true : null)
                              }
                            />
                            <label htmlFor={`correct-${index}`} className="text-sm text-green-600">
                              Correct
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`incorrect-${index}`}
                              checked={field.isCorrect === false}
                              onCheckedChange={(checked) => 
                                updateVerificationField(index, 'isCorrect', checked ? false : null)
                              }
                            />
                            <label htmlFor={`incorrect-${index}`} className="text-sm text-red-600">
                              Incorrect
                            </label>
                          </div>
                        </div>
                        
                        <Textarea
                          placeholder="Add notes (optional)"
                          value={field.notes}
                          onChange={(e) => updateVerificationField(index, 'notes', e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        
                        {field.isCorrect !== null && (
                          <Badge 
                            variant={field.isCorrect ? "default" : "destructive"}
                            className="w-fit"
                          >
                            {field.isCorrect ? "Verified Correct" : "Needs Correction"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Verification Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {verificationFields.filter(f => f.isCorrect === true).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Verified Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {verificationFields.filter(f => f.isCorrect === false).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Need Correction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {verificationFields.filter(f => f.isCorrect === null).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TvtLeadDetail;
