
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Lead } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { Check, X, Save } from 'lucide-react';

interface FieldVerification {
  fieldName: string;
  originalValue: string;
  verifiedValue: string;
  isVerified: boolean;
  isCorrect: boolean;
  notes: string;
}

interface LeadVerificationFormProps {
  lead: Lead;
  onSave: (verificationData: FieldVerification[]) => void;
}

const LeadVerificationForm: React.FC<LeadVerificationFormProps> = ({ lead, onSave }) => {
  const [verificationFields, setVerificationFields] = useState<FieldVerification[]>([]);
  const [overallNotes, setOverallNotes] = useState('');

  useEffect(() => {
    // Initialize verification fields with lead data
    const fields: FieldVerification[] = [
      // Personal Information
      { fieldName: 'Name', originalValue: lead.name, verifiedValue: lead.name, isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Age', originalValue: lead.age.toString(), verifiedValue: lead.age.toString(), isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Phone', originalValue: lead.phone || '', verifiedValue: lead.phone || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Email', originalValue: lead.email || '', verifiedValue: lead.email || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Job/Occupation', originalValue: lead.job || '', verifiedValue: lead.job || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Address Information
      { fieldName: 'Street Address', originalValue: lead.address?.street || '', verifiedValue: lead.address?.street || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'City', originalValue: lead.address?.city || '', verifiedValue: lead.address?.city || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'District', originalValue: lead.address?.district || '', verifiedValue: lead.address?.district || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'State', originalValue: lead.address?.state || '', verifiedValue: lead.address?.state || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Pincode', originalValue: lead.address?.pincode || '', verifiedValue: lead.address?.pincode || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Professional Details
      { fieldName: 'Company', originalValue: lead.additionalDetails?.company || '', verifiedValue: lead.additionalDetails?.company || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Designation', originalValue: lead.additionalDetails?.designation || '', verifiedValue: lead.additionalDetails?.designation || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Work Experience', originalValue: lead.additionalDetails?.workExperience || '', verifiedValue: lead.additionalDetails?.workExperience || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Monthly Income', originalValue: lead.additionalDetails?.monthlyIncome?.toString() || '', verifiedValue: lead.additionalDetails?.monthlyIncome?.toString() || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Annual Income', originalValue: lead.additionalDetails?.annualIncome || '', verifiedValue: lead.additionalDetails?.annualIncome || '', isVerified: false, isCorrect: false, notes: '' },
      
      // Family Details
      { fieldName: 'Father Name', originalValue: lead.additionalDetails?.fatherName || '', verifiedValue: lead.additionalDetails?.fatherName || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Mother Name', originalValue: lead.additionalDetails?.motherName || '', verifiedValue: lead.additionalDetails?.motherName || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Gender', originalValue: lead.additionalDetails?.gender || '', verifiedValue: lead.additionalDetails?.gender || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Date of Birth', originalValue: lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : '', verifiedValue: lead.additionalDetails?.dateOfBirth ? new Date(lead.additionalDetails.dateOfBirth).toLocaleDateString() : '', isVerified: false, isCorrect: false, notes: '' },
      
      // Loan Details
      { fieldName: 'Loan Amount', originalValue: lead.additionalDetails?.loanAmount || '', verifiedValue: lead.additionalDetails?.loanAmount || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Loan Type', originalValue: lead.additionalDetails?.loanType || '', verifiedValue: lead.additionalDetails?.loanType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Property Type', originalValue: lead.additionalDetails?.propertyType || '', verifiedValue: lead.additionalDetails?.propertyType || '', isVerified: false, isCorrect: false, notes: '' },
      { fieldName: 'Ownership Status', originalValue: lead.additionalDetails?.ownershipStatus || '', verifiedValue: lead.additionalDetails?.ownershipStatus || '', isVerified: false, isCorrect: false, notes: '' },
    ];

    setVerificationFields(fields.filter(field => field.originalValue.trim() !== ''));
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

  return (
    <div className="space-y-6">
      {/* Verification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary">
              Total: {stats.totalFields}
            </Badge>
            <Badge variant="default">
              Verified: {stats.verifiedFields}
            </Badge>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Correct: {stats.correctFields}
            </Badge>
            <Badge variant="default" className="bg-red-100 text-red-800">
              Incorrect: {stats.incorrectFields}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Verification Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Data Verification</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare original data with verified information during the call with the applicant
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verificationFields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Data Column */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Original Data
                    </Label>
                    <div className="mt-2">
                      <Label className="font-semibold">{field.fieldName}</Label>
                      <p className="text-sm bg-muted p-2 rounded mt-1">
                        {field.originalValue || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Verified Data Column */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Verified Data
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label className="font-semibold">{field.fieldName}</Label>
                        <Input
                          value={field.verifiedValue}
                          onChange={(e) => updateField(index, 'verifiedValue', e.target.value)}
                          placeholder="Enter verified value"
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Verification Status */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`verified-${index}`}
                            checked={field.isVerified}
                            onCheckedChange={(checked) => updateField(index, 'isVerified', checked)}
                          />
                          <Label htmlFor={`verified-${index}`}>Field Verified</Label>
                        </div>

                        {field.isVerified && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`correct-${index}`}
                                checked={field.isCorrect}
                                onCheckedChange={(checked) => updateField(index, 'isCorrect', checked)}
                              />
                              <Label htmlFor={`correct-${index}`} className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-green-600" />
                                Correct
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`incorrect-${index}`}
                                checked={field.isVerified && !field.isCorrect}
                                onCheckedChange={(checked) => updateField(index, 'isCorrect', !checked)}
                              />
                              <Label htmlFor={`incorrect-${index}`} className="flex items-center gap-1">
                                <X className="h-4 w-4 text-red-600" />
                                Incorrect
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <Label htmlFor={`notes-${index}`}>Verification Notes</Label>
                        <Textarea
                          id={`notes-${index}`}
                          value={field.notes}
                          onChange={(e) => updateField(index, 'notes', e.target.value)}
                          placeholder="Add notes about this verification..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            placeholder="Add overall notes about the verification process..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Verification
        </Button>
      </div>
    </div>
  );
};

export default LeadVerificationForm;
