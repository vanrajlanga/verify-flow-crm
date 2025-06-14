
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lead, User, Bank, Document } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { updateLeadInDatabase } from '@/lib/lead-operations';
import DocumentViewer from '@/components/shared/DocumentViewer';
import { Upload, X } from 'lucide-react';

interface EditLeadFormProps {
  lead: Lead;
  agents: User[];
  banks: Bank[];
  onUpdate: (updatedLead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

const EditLeadForm = ({ lead, agents, banks, onUpdate, onClose, locationData }: EditLeadFormProps) => {
  const [formData, setFormData] = useState({
    name: lead.name || '',
    job: lead.job || '',
    bank: lead.bank || '',
    visitType: lead.visitType || 'Residence',
    assignedTo: lead.assignedTo || '',
    instructions: lead.instructions || '',
    status: lead.status || 'Pending',
    // Address fields
    addressType: lead.address?.type || 'Residence',
    street: lead.address?.street || '',
    city: lead.address?.city || '',
    district: lead.address?.district || '',
    state: lead.address?.state || '',
    pincode: lead.address?.pincode || '',
    // Additional details without the removed fields
    company: lead.additionalDetails?.company || '',
    designation: lead.additionalDetails?.designation || '',
    workExperience: lead.additionalDetails?.workExperience || '',
    monthlyIncome: lead.additionalDetails?.monthlyIncome || '',
    annualIncome: lead.additionalDetails?.annualIncome || '',
    otherIncome: lead.additionalDetails?.otherIncome || '',
    phoneNumber: lead.additionalDetails?.phoneNumber || '',
    propertyType: lead.additionalDetails?.propertyType || '',
    ownershipStatus: lead.additionalDetails?.ownershipStatus || '',
    propertyAge: lead.additionalDetails?.propertyAge || '',
    agencyFileNo: lead.additionalDetails?.agencyFileNo || '',
    caseId: lead.additionalDetails?.caseId || '',
    loanAmount: lead.additionalDetails?.loanAmount || '',
    loanType: lead.additionalDetails?.loanType || '',
    additionalComments: lead.additionalDetails?.additionalComments || ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>(lead.documents || []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Simulate file upload - in a real app, this would upload to a server or cloud storage
      const newDocuments: Document[] = Array.from(files).map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file), // This creates a local URL for preview
        uploadedBy: 'Current User',
        uploadDate: new Date(),
        size: file.size
      }));

      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      toast({
        title: "Documents uploaded",
        description: `${newDocuments.length} document(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Document removed",
      description: "Document has been removed from the lead.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedLead: Lead = {
        ...lead,
        name: formData.name,
        job: formData.job,
        bank: formData.bank,
        visitType: formData.visitType as 'Residence' | 'Office' | 'Both',
        assignedTo: formData.assignedTo,
        instructions: formData.instructions,
        status: formData.status as 'Pending' | 'In Progress' | 'Completed' | 'Rejected',
        address: {
          type: formData.addressType,
          street: formData.street,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode
        },
        additionalDetails: {
          company: formData.company,
          designation: formData.designation,
          workExperience: formData.workExperience,
          monthlyIncome: formData.monthlyIncome,
          annualIncome: formData.annualIncome,
          otherIncome: formData.otherIncome,
          phoneNumber: formData.phoneNumber,
          propertyType: formData.propertyType,
          ownershipStatus: formData.ownershipStatus,
          propertyAge: formData.propertyAge,
          agencyFileNo: formData.agencyFileNo,
          caseId: formData.caseId,
          loanAmount: formData.loanAmount,
          loanType: formData.loanType,
          additionalComments: formData.additionalComments,
          addresses: [
            {
              type: formData.addressType,
              street: formData.street,
              city: formData.city,
              district: formData.district,
              state: formData.state,
              pincode: formData.pincode
            }
          ]
        },
        documents: uploadedDocuments
      };

      // Update in database
      await updateLeadInDatabase(updatedLead);
      
      onUpdate(updatedLead);
      
      toast({
        title: "Lead updated",
        description: "Lead has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Update failed",
        description: "Failed to update lead. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Lead</h2>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Update Lead
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="job">Occupation *</Label>
              <Input
                id="job"
                value={formData.job}
                onChange={(e) => handleInputChange('job', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank & Loan Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bank & Loan Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank">Bank *</Label>
              <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="e.g., 5000000"
              />
            </div>
            <div>
              <Label htmlFor="loanType">Loan Type</Label>
              <Input
                id="loanType"
                value={formData.loanType}
                onChange={(e) => handleInputChange('loanType', e.target.value)}
                placeholder="e.g., Home Loan, Personal Loan"
              />
            </div>
            <div>
              <Label htmlFor="agencyFileNo">Agency File No</Label>
              <Input
                id="agencyFileNo"
                value={formData.agencyFileNo}
                onChange={(e) => handleInputChange('agencyFileNo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addressType">Address Type</Label>
              <Select value={formData.addressType} onValueChange={(value) => handleInputChange('addressType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residence">Residence</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visitType">Visit Type *</Label>
              <Select value={formData.visitType} onValueChange={(value) => handleInputChange('visitType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residence">Residence</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>
                      {agent.name} - {agent.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="document-upload">Upload Documents</Label>
            <div className="mt-2">
              <input
                id="document-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('document-upload')?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
            </p>
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Documents</h4>
              <div className="grid gap-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Unknown size'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedDocuments.length > 0 && (
            <DocumentViewer documents={uploadedDocuments} title="Lead Documents" />
          )}
        </CardContent>
      </Card>

      {/* Additional Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additionalComments">Additional Comments</Label>
            <Textarea
              id="additionalComments"
              value={formData.additionalComments}
              onChange={(e) => handleInputChange('additionalComments', e.target.value)}
              rows={3}
              placeholder="Any additional notes or comments about this lead..."
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default EditLeadForm;

