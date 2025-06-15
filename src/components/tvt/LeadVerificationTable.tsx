import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Lead } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { Check, X, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DocumentViewer from '@/components/shared/DocumentViewer';

interface FieldVerification {
  fieldName: string;
  originalValue: string;
  verifiedValue: string;
  isVerified: boolean;
  isCorrect: boolean;
  notes: string;
}

interface LeadVerificationTableProps {
  lead: Lead;
  onSave: (verificationData: FieldVerification[]) => void;
}

// Define the document type that matches DocumentViewer expectations
interface DocumentForViewer {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadDate: Date | string;
  size?: number;
}

const LeadVerificationTable: React.FC<LeadVerificationTableProps> = ({ lead, onSave }) => {
  const [verificationFields, setVerificationFields] = useState<FieldVerification[]>([]);
  const [overallNotes, setOverallNotes] = useState('');

  useEffect(() => {
    // Initialize verification fields with ALL lead data including COMPLETE ADDRESS
    const fields: FieldVerification[] = [
      // Basic Lead Information
      { fieldName: 'Lead ID', originalValue: lead.id, verifiedValue: lead.id, isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Name', originalValue: lead.name, verifiedValue: lead.name, isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Age', originalValue: lead.age.toString(), verifiedValue: lead.age.toString(), isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Job/Occupation', originalValue: lead.job || '', verifiedValue: lead.job || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Status', originalValue: lead.status || '', verifiedValue: lead.status || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Visit Type', originalValue: lead.visitType || '', verifiedValue: lead.visitType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Assigned To', originalValue: lead.assignedTo || '', verifiedValue: lead.assignedTo || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Instructions', originalValue: lead.instructions || '', verifiedValue: lead.instructions || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Has Co-Applicant', originalValue: lead.hasCoApplicant ? 'Yes' : 'No', verifiedValue: lead.hasCoApplicant ? 'Yes' : 'No', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Co-Applicant Name', originalValue: lead.coApplicantName || '', verifiedValue: lead.coApplicantName || '', isVerified: false, isCorrect: false, notes: '' },
      
      // COMPLETE Address Information
      { fieldName: 'Street Address', originalValue: lead.address?.street || '', verifiedValue: lead.address?.street || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'City', originalValue: lead.address?.city || '', verifiedValue: lead.address?.city || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'District', originalValue: lead.address?.district || '', verifiedValue: lead.address?.district || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'State', originalValue: lead.address?.state || '', verifiedValue: lead.address?.state || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Pincode', originalValue: lead.address?.pincode || '', verifiedValue: lead.address?.pincode || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Contact Information
      { fieldName: 'Phone', originalValue: lead.phone || '', verifiedValue: lead.phone || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Email', originalValue: lead.email || '', verifiedValue: lead.email || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Professional Details
      { fieldName: 'Company', originalValue: lead.additionalDetails?.company || '', verifiedValue: lead.additionalDetails?.company || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Designation', originalValue: lead.additionalDetails?.designation || '', verifiedValue: lead.additionalDetails?.designation || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Work Experience', originalValue: lead.additionalDetails?.workExperience || '', verifiedValue: lead.additionalDetails?.workExperience || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Monthly Income', originalValue: lead.additionalDetails?.monthlyIncome?.toString() || '', verifiedValue: lead.additionalDetails?.monthlyIncome?.toString() || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Annual Income', originalValue: lead.additionalDetails?.annualIncome || '', verifiedValue: lead.additionalDetails?.annualIncome || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Other Income', originalValue: lead.additionalDetails?.otherIncome || '', verifiedValue: lead.additionalDetails?.otherIncome || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Family Details
      { fieldName: 'Father Name', originalValue: lead.additionalDetails?.fatherName || '', verifiedValue: lead.additionalDetails?.fatherName || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Mother Name', originalValue: lead.additionalDetails?.motherName || '', verifiedValue: lead.additionalDetails?.motherName || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Gender', originalValue: lead.additionalDetails?.gender || '', verifiedValue: lead.additionalDetails?.gender || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Date of Birth', originalValue: lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : '', verifiedValue: lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : '', isVerified: false, isCorrect: false, notes: '' },
      
      // Loan Details
      { fieldName: 'Loan Amount', originalValue: lead.additionalDetails?.loanAmount || '', verifiedValue: lead.additionalDetails?.loanAmount || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Loan Type', originalValue: lead.additionalDetails?.loanType || '', verifiedValue: lead.additionalDetails?.loanType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Property Type', originalValue: lead.additionalDetails?.propertyType || '', verifiedValue: lead.additionalDetails?.propertyType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Property Age', originalValue: lead.additionalDetails?.propertyAge || '', verifiedValue: lead.additionalDetails?.propertyAge || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Ownership Status', originalValue: lead.additionalDetails?.ownershipStatus || '', verifiedValue: lead.additionalDetails?.ownershipStatus || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Vehicle Details (if applicable)
      { fieldName: 'Vehicle Brand', originalValue: lead.additionalDetails?.vehicleBrandName || '', verifiedValue: lead.additionalDetails?.vehicleBrandName || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Vehicle Model', originalValue: lead.additionalDetails?.vehicleModelName || '', verifiedValue: lead.additionalDetails?.vehicleModelName || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Bank and Product Details
      { fieldName: 'Bank', originalValue: lead.bank || '', verifiedValue: lead.bank || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Bank Product', originalValue: lead.additionalDetails?.bankProduct || '', verifiedValue: lead.additionalDetails?.bankProduct || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Bank Branch', originalValue: lead.additionalDetails?.bankBranch || '', verifiedValue: lead.additionalDetails?.bankBranch || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Additional Fields
      { fieldName: 'Case ID', originalValue: lead.additionalDetails?.caseId || '', verifiedValue: lead.additionalDetails?.caseId || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Agency File No', originalValue: lead.additionalDetails?.agencyFileNo || '', verifiedValue: lead.additionalDetails?.agencyFileNo || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Application Barcode', originalValue: lead.additionalDetails?.applicationBarcode || '', verifiedValue: lead.additionalDetails?.applicationBarcode || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Scheme Description', originalValue: lead.additionalDetails?.schemeDesc || '', verifiedValue: lead.additionalDetails?.schemeDesc || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Phone Number (Additional)', originalValue: lead.additionalDetails?.phoneNumber || '', verifiedValue: lead.additionalDetails?.phoneNumber || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Email (Additional)', originalValue: lead.additionalDetails?.email || '', verifiedValue: lead.additionalDetails?.email || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Lead Type', originalValue: lead.additionalDetails?.leadType || '', verifiedValue: lead.additionalDetails?.leadType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Lead Type ID', originalValue: lead.additionalDetails?.leadTypeId || '', verifiedValue: lead.additionalDetails?.leadTypeId || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Vehicle Brand ID', originalValue: lead.additionalDetails?.vehicleBrandId || '', verifiedValue: lead.additionalDetails?.vehicleBrandId || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Vehicle Model ID', originalValue: lead.additionalDetails?.vehicleModelId || '', verifiedValue: lead.additionalDetails?.vehicleModelId || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Additional Comments', originalValue: lead.additionalDetails?.additionalComments || '', verifiedValue: lead.additionalDetails?.additionalComments || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Timestamps
      { fieldName: 'Created Date', originalValue: new Date(lead.createdAt).toLocaleDateString(), verifiedValue: new Date(lead.createdAt).toLocaleDateString(), isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Updated Date', originalValue: new Date(lead.updatedAt).toLocaleDateString(), verifiedValue: new Date(lead.updatedAt).toLocaleDateString(), isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Verification Date', originalValue: lead.verificationDate ? new Date(lead.verificationDate).toLocaleDateString() : '', verifiedValue: lead.verificationDate ? new Date(lead.verificationDate).toLocaleDateString() : '', isVerified: false, isCorrect: false, notes: '' },
    ];

    // Show ALL fields, including empty ones for verification
    setVerificationFields(fields);
  }, [lead]);

  const updateField = (index: number, field: keyof FieldVerification, value: any) => {
    const updatedFields = [...verificationFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setVerificationFields(updatedFields);
  };

  const handleSave = () => {
    const verifiedFieldsCount = verificationFields.filter(field => field.isVerified).length;
    
    if (verifiedFieldsCount === 0) {
      toast({
        title: "No fields verified",
        description: "Please verify at least one field before saving.",
        variant: "destructive"
      });
      return;
    }

    onSave(verificationFields);
    
    toast({
      title: "Verification Saved",
      description: `${verifiedFieldsCount} fields verified and saved successfully.`,
    });
  };

  const getVerificationStats = () => {
    const totalFields = verificationFields.length;
    const verifiedFields = verificationFields.filter(field => field.isVerified).length;
    const correctFields = verificationFields.filter(field => field.isVerified && field.isCorrect).length;
    const incorrectFields = verificationFields.filter(field => field.isVerified && !field.isCorrect).length;

    return { totalFields, verifiedFields, correctFields, incorrectFields };
  };

  const stats = getVerificationStats();

  // Convert lead documents to match DocumentViewer expectations
  const leadDocuments: DocumentForViewer[] = lead.documents ? 
    lead.documents.map(doc => ({
      id: doc.id,
      name: doc.name || 'Document',
      type: doc.type,
      url: doc.url,
      uploadedBy: 'System',
      uploadDate: doc.uploadedAt,
      size: 1024000
    })) : [
      {
        id: '1',
        name: 'Aadhar Card.pdf',
        type: 'PDF',
        url: '/placeholder.svg',
        uploadedBy: 'Agent',
        uploadDate: new Date(),
        size: 1024000
      },
      {
        id: '2',
        name: 'Income Certificate.jpg',
        type: 'Image',
        url: '/placeholder.svg',
        uploadedBy: 'Applicant',
        uploadDate: new Date(),
        size: 512000
      },
      {
        id: '3',
        name: 'Bank Statement.pdf',
        type: 'PDF',
        url: '/placeholder.svg',
        uploadedBy: 'Agent',
        uploadDate: new Date(),
        size: 2048000
      }
    ];

  return (
    <div className="space-y-6">
      {/* Verification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress - ALL FIELDS A to Z</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary">Total: {stats.totalFields}</Badge>
            <Badge variant="default">Verified: {stats.verifiedFields}</Badge>
            <Badge variant="default" className="bg-green-100 text-green-800">Correct: {stats.correctFields}</Badge>
            <Badge variant="default" className="bg-red-100 text-red-800">Incorrect: {stats.incorrectFields}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Verification Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Data Verification - Complete A to Z Spreadsheet View</CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify each field by comparing original data with verified information during the call. ALL {verificationFields.length} fields are shown including complete address details.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Field Name</TableHead>
                  <TableHead className="w-[200px]">Original Data</TableHead>
                  <TableHead className="w-[200px]">Verified Data</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Verification</TableHead>
                  <TableHead className="min-w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationFields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{field.fieldName}</TableCell>
                    <TableCell>
                      <div className="text-sm bg-muted p-2 rounded max-w-[180px] truncate">
                        {field.originalValue || 'Not provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={field.verifiedValue}
                        onChange={(e) => updateField(index, 'verifiedValue', e.target.value)}
                        placeholder="Enter verified value"
                        className="text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      {field.isVerified ? (
                        <Badge className={field.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {field.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`verified-${index}`}
                            checked={field.isVerified}
                            onCheckedChange={(checked) => updateField(index, 'isVerified', checked)}
                          />
                          <label htmlFor={`verified-${index}`} className="text-sm">Verified</label>
                        </div>
                        {field.isVerified && (
                          <div className="flex gap-1">
                            <Button
                              variant={field.isCorrect ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateField(index, 'isCorrect', true)}
                              className="h-6 px-2"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={!field.isCorrect && field.isVerified ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => updateField(index, 'isCorrect', false)}
                              className="h-6 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={field.notes}
                        onChange={(e) => updateField(index, 'notes', e.target.value)}
                        placeholder="Add verification notes..."
                        className="text-sm min-h-[60px]"
                        rows={2}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents Verification</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and verify all uploaded documents
          </p>
        </CardHeader>
        <CardContent>
          <DocumentViewer 
            documents={leadDocuments} 
            title="Lead Documents for Verification"
          />
        </CardContent>
      </Card>

      {/* Overall Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Verification Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="Add overall notes about the verification process, call quality, applicant cooperation, etc..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
        <Button onClick={handleSave} className="flex items-center gap-2" size="lg">
          <Save className="h-4 w-4" />
          Save Verification ({stats.verifiedFields}/{stats.totalFields} verified)
        </Button>
      </div>
    </div>
  );
};

export default LeadVerificationTable;
