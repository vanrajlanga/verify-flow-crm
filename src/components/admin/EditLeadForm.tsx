
import { useState, useEffect } from 'react';
import { Lead, User, Bank } from '@/utils/mockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditLeadFormProps {
  lead: Lead;
  agents: User[];
  banks: Bank[];
  onUpdate: (updatedLead: Lead) => void;
  onClose: () => void;
  locationData: any;
}

const EditLeadForm = ({ lead, agents, banks, onUpdate, onClose, locationData }: EditLeadFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<Lead>(lead);

  useEffect(() => {
    setFormData(lead);
  }, [lead]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAdditionalDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        [field]: value
      }
    }));
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Lead name is required.",
        variant: "destructive",
      });
      return;
    }

    onUpdate(formData);
    toast({
      title: "Lead updated",
      description: `${formData.name} has been updated successfully.`,
    });
    onClose();
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
          <TabsTrigger value="contact" className="flex-1">Contact & Address</TabsTrigger>
          <TabsTrigger value="financial" className="flex-1">Financial Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Customer Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Age
              </label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="agencyFileNo" className="text-sm font-medium">
                Agency File No
              </label>
              <Input
                id="agencyFileNo"
                value={formData.additionalDetails?.agencyFileNo || ''}
                onChange={(e) => handleAdditionalDetailsChange('agencyFileNo', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="visitType" className="text-sm font-medium">
                Visit Type
              </label>
              <Select 
                value={formData.visitType}
                onValueChange={(value) => handleInputChange('visitType', value)}
              >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bank" className="text-sm font-medium">
                Bank
              </label>
              <Select 
                value={formData.bank}
                onValueChange={(value) => handleInputChange('bank', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="assignedTo" className="text-sm font-medium">
                Assigned Agent
              </label>
              <Select 
                value={formData.assignedTo}
                onValueChange={(value) => handleInputChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as Lead['status'])}
            >
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
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              value={formData.additionalDetails?.phoneNumber || ''}
              onChange={(e) => handleAdditionalDetailsChange('phoneNumber', e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium">
                  Street Address
                </label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="district" className="text-sm font-medium">
                    District
                  </label>
                  <Input
                    id="district"
                    value={formData.address.district}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="pincode" className="text-sm font-medium">
                    Pincode
                  </label>
                  <Input
                    id="pincode"
                    value={formData.address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loanAmount" className="text-sm font-medium">
                Loan Amount
              </label>
              <Input
                id="loanAmount"
                value={formData.additionalDetails?.loanAmount || ''}
                onChange={(e) => handleAdditionalDetailsChange('loanAmount', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="monthlyIncome" className="text-sm font-medium">
                Monthly Income
              </label>
              <Input
                id="monthlyIncome"
                value={formData.additionalDetails?.monthlyIncome || ''}
                onChange={(e) => handleAdditionalDetailsChange('monthlyIncome', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                value={formData.additionalDetails?.company || ''}
                onChange={(e) => handleAdditionalDetailsChange('company', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="designation" className="text-sm font-medium">
                Designation
              </label>
              <Input
                id="designation"
                value={formData.additionalDetails?.designation || ''}
                onChange={(e) => handleAdditionalDetailsChange('designation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="instructions" className="text-sm font-medium">
              Instructions
            </label>
            <Textarea
              id="instructions"
              value={formData.instructions || ''}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpdate}>
          Update Lead
        </Button>
      </div>
    </div>
  );
};

export default EditLeadForm;
