import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Lead, mockLeads } from '@/utils/mockData';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import DocumentViewer from '@/components/shared/DocumentViewer';
import { toast } from '@/components/ui/use-toast';
import { Save, ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and has TVTTEAM role
    const storedUser = localStorage.getItem('kycUser');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log('TVT Lead Detail - Current user:', parsedUser);
    
    if (parsedUser.role !== 'tvtteam') {
      console.log('User is not TVT team member, redirecting...');
      navigate('/');
      return;
    }

    setCurrentUser(parsedUser);
    loadLeadData();
  }, [leadId, navigate]);

  const loadLeadData = () => {
    setIsLoading(true);
    try {
      console.log('Loading lead data for leadId:', leadId);
      
      // First try localStorage
      const storedLeads = localStorage.getItem('mockLeads');
      let allLeads = [];
      
      if (storedLeads) {
        try {
          allLeads = JSON.parse(storedLeads);
          console.log('Found leads in localStorage:', allLeads.length);
        } catch (error) {
          console.error('Error parsing stored leads:', error);
        }
      }
      
      // If no stored leads, use mockLeads
      if (allLeads.length === 0) {
        allLeads = mockLeads;
        console.log('Using mock leads:', allLeads.length);
      }
      
      const foundLead = allLeads.find((l: Lead) => l.id === leadId);
      console.log('Found lead:', foundLead);
      
      if (foundLead) {
        setLead(foundLead);
        initializeVerificationFields(foundLead);
      } else {
        console.error('Lead not found with ID:', leadId);
        toast({
          title: "Lead not found",
          description: "The requested lead could not be found.",
          variant: "destructive"
        });
        navigate('/tvt');
      }
    } catch (error) {
      console.error('Error loading lead data:', error);
      toast({
        title: "Error loading lead",
        description: "There was an error loading the lead data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeVerificationFields = (leadData: Lead) => {
    console.log('Initializing verification fields for:', leadData);
    
    const fields: VerificationField[] = [
      {
        fieldName: 'Lead ID',
        originalValue: leadData.id || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Customer Name',
        originalValue: leadData.name || '',
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
        originalValue: leadData.additionalDetails?.phoneNumber || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Email',
        originalValue: leadData.additionalDetails?.email || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Company',
        originalValue: leadData.additionalDetails?.company || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Designation',
        originalValue: leadData.additionalDetails?.designation || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Work Experience',
        originalValue: leadData.additionalDetails?.workExperience || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Monthly Income',
        originalValue: leadData.additionalDetails?.monthlyIncome || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Annual Income',
        originalValue: leadData.additionalDetails?.annualIncome || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Other Income',
        originalValue: leadData.additionalDetails?.otherIncome || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Date of Birth',
        originalValue: leadData.additionalDetails?.dateOfBirth || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Residence Address',
        originalValue: leadData.address ? 
          `${leadData.address.street || ''}, ${leadData.address.city || ''}, ${leadData.address.district || ''}, ${leadData.address.state || ''} - ${leadData.address.pincode || ''}` : 
          'Address not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Property Type',
        originalValue: leadData.additionalDetails?.propertyType || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Property Age',
        originalValue: leadData.additionalDetails?.propertyAge || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Ownership Status',
        originalValue: leadData.additionalDetails?.ownershipStatus || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Bank',
        originalValue: leadData.bank || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Bank Branch',
        originalValue: leadData.additionalDetails?.bankBranch || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Lead Type',
        originalValue: leadData.additionalDetails?.leadType || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Loan Type',
        originalValue: leadData.additionalDetails?.loanType || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Loan Amount',
        originalValue: leadData.additionalDetails?.loanAmount || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Application Barcode',
        originalValue: leadData.additionalDetails?.applicationBarcode || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Agency File No',
        originalValue: leadData.additionalDetails?.agencyFileNo || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Case ID',
        originalValue: leadData.additionalDetails?.caseId || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Vehicle Brand',
        originalValue: leadData.additionalDetails?.vehicleBrandName || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Vehicle Model',
        originalValue: leadData.additionalDetails?.vehicleModelName || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Scheme Description',
        originalValue: leadData.additionalDetails?.schemeDesc || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Additional Comments',
        originalValue: leadData.additionalDetails?.additionalComments || 'Not provided',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Visit Type',
        originalValue: leadData.visitType || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Instructions',
        originalValue: leadData.instructions || 'No instructions',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Assigned To',
        originalValue: leadData.assignedTo || 'Unassigned',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      },
      {
        fieldName: 'Created Date',
        originalValue: new Date(leadData.createdAt).toLocaleDateString(),
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
      fields.push({
        fieldName: 'Co-Applicant Email',
        originalValue: leadData.additionalDetails.coApplicant.email || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      });
      fields.push({
        fieldName: 'Co-Applicant Relationship',
        originalValue: leadData.additionalDetails.coApplicant.relation || '',
        verifiedValue: '',
        isCorrect: null,
        notes: ''
      });
    }

    console.log('Initialized verification fields:', fields);
    setVerificationFields(fields);
  };

  const updateVerificationField = (index: number, field: keyof VerificationField, value: string | boolean | null) => {
    const updatedFields = [...verificationFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setVerificationFields(updatedFields);
  };

  const handleSaveVerification = async () => {
    try {
      console.log('Saving verification for lead:', leadId);
      console.log('Verification fields:', verificationFields);
      
      // Save verification data to localStorage
      const verificationData = {
        leadId,
        verificationFields,
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.id,
        completedByName: currentUser?.name
      };

      const existingVerifications = localStorage.getItem('leadVerifications') || '[]';
      const verifications = JSON.parse(existingVerifications);
      
      // Remove existing verification for this lead if any
      const filteredVerifications = verifications.filter((v: any) => v.leadId !== leadId);
      filteredVerifications.push(verificationData);
      
      localStorage.setItem('leadVerifications', JSON.stringify(filteredVerifications));

      // Update lead status to completed
      const storedLeads = localStorage.getItem('mockLeads');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const updatedLeads = leads.map((l: Lead) => {
          if (l.id === leadId) {
            return { ...l, status: 'Completed' as const };
          }
          return l;
        });
        localStorage.setItem('mockLeads', JSON.stringify(updatedLeads));
      }

      toast({
        title: "Verification Saved",
        description: "Lead verification data has been saved successfully.",
      });

      // Navigate back to dashboard
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

  // Mock documents for demonstration
  const mockDocuments = [
    {
      id: '1',
      name: 'Aadhaar Card.pdf',
      type: 'PDF',
      url: '/placeholder.svg',
      uploadedBy: 'System',
      uploadDate: new Date(),
      size: 245760
    },
    {
      id: '2',
      name: 'Income Certificate.jpg',
      type: 'Image',
      url: '/placeholder.svg',
      uploadedBy: 'Agent',
      uploadDate: new Date(),
      size: 512000
    },
    {
      id: '3',
      name: 'Bank Statement.pdf',
      type: 'PDF',
      url: '/placeholder.svg',
      uploadedBy: 'Customer',
      uploadDate: new Date(),
      size: 1024000
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Error: Unable to load lead data</p>
          <Button onClick={() => navigate('/tvt')} className="mt-4">
            Back to Dashboard
          </Button>
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

            {/* Lead Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Lead ID:</span>
                    <p>{lead.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Bank:</span>
                    <p>{lead.bank}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Visit Type:</span>
                    <p>{lead.visitType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge className={
                      lead.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lead Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentViewer 
                  documents={mockDocuments} 
                  title="Uploaded Documents"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Lead Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Original Lead Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[800px] overflow-y-auto">
                    {verificationFields.map((field, index) => (
                      <div key={field.fieldName} className="space-y-2 p-3 border rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground">
                          {field.fieldName}:
                        </label>
                        <p className="text-sm bg-muted p-2 rounded border min-h-[40px] flex items-center">
                          {field.originalValue || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verified Data Entry */}
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
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
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

            {/* Verification Summary */}
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
