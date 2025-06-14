
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead, User, Address } from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

interface EditLeadDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadId: string, updates: Partial<Lead>, assignedAgents: string[]) => void;
  agents: User[];
  banks: any[];
}

const EditLeadDialog: React.FC<EditLeadDialogProps> = ({
  lead,
  isOpen,
  onClose,
  onSave,
  agents,
  banks
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    job: '',
    bank: '',
    status: 'Pending' as Lead['status'],
    visitType: 'Physical' as Lead['visitType'],
    instructions: '',
    // Address fields
    addressType: 'Residence' as Address['type'],
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    // Additional details
    company: '',
    designation: '',
    phoneNumber: '',
    email: '',
    monthlyIncome: '',
    annualIncome: '',
    loanAmount: '',
    loanType: '',
    vehicleBrand: '',
    vehicleModel: ''
  });

  const [assignedAgents, setAssignedAgents] = useState<string[]>([]);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        age: lead.age || 0,
        job: lead.job || '',
        bank: lead.bank || '',
        status: lead.status || 'Pending',
        visitType: lead.visitType || 'Physical',
        instructions: lead.instructions || '',
        // Address
        addressType: lead.address?.type || 'Residence',
        street: lead.address?.street || '',
        city: lead.address?.city || '',
        district: lead.address?.district || '',
        state: lead.address?.state || '',
        pincode: lead.address?.pincode || '',
        // Additional details
        company: lead.additionalDetails?.company || '',
        designation: lead.additionalDetails?.designation || '',
        phoneNumber: lead.additionalDetails?.phoneNumber || '',
        email: lead.additionalDetails?.email || '',
        monthlyIncome: lead.additionalDetails?.monthlyIncome?.toString() || '',
        annualIncome: lead.additionalDetails?.annualIncome || '',
        loanAmount: lead.additionalDetails?.loanAmount || '',
        loanType: lead.additionalDetails?.loanType || '',
        vehicleBrand: lead.additionalDetails?.vehicleBrandName || '',
        vehicleModel: lead.additionalDetails?.vehicleModelName || ''
      });

      // Set currently assigned agents (convert single assignedTo to array)
      if (lead.assignedTo) {
        setAssignedAgents([lead.assignedTo]);
      } else {
        setAssignedAgents([]);
      }
    }
  }, [lead]);

  const handleAgentToggle = (agentId: string) => {
    setAssignedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSave = () => {
    if (!lead) return;

    const updates: Partial<Lead> = {
      name: formData.name,
      age: formData.age,
      job: formData.job,
      bank: formData.bank,
      status: formData.status,
      visitType: formData.visitType,
      instructions: formData.instructions,
      address: {
        type: formData.addressType,
        street: formData.street,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      },
      additionalDetails: {
        ...lead.additionalDetails,
        company: formData.company,
        designation: formData.designation,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : 0,
        annualIncome: formData.annualIncome,
        loanAmount: formData.loanAmount,
        loanType: formData.loanType,
        vehicleBrandName: formData.vehicleBrand,
        vehicleModelName: formData.vehicleModel
      }
    };

    onSave(lead.id, updates, assignedAgents);
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead: {lead.name}</DialogTitle>
          <DialogDescription>
            Update lead information and assign multiple agents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="job">Job/Designation</Label>
                <Input
                  id="job"
                  value={formData.job}
                  onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank</Label>
                <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
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
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Lead['status'] })}>
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
              <div>
                <Label htmlFor="visitType">Visit Type</Label>
                <Select value={formData.visitType} onValueChange={(value) => setFormData({ ...formData, visitType: value as Lead['visitType'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  id="annualIncome"
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loan & Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Loan & Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input
                  id="loanAmount"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="loanType">Loan Type</Label>
                <Input
                  id="loanType"
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                <Input
                  id="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Assignment</CardTitle>
              <CardDescription>
                Select multiple agents to assign to this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {assignedAgents.map(agentId => {
                    const agent = agents.find(a => a.id === agentId);
                    return agent ? (
                      <Badge key={agentId} variant="secondary" className="flex items-center gap-1">
                        {agent.name} ({agent.role})
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleAgentToggle(agentId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {assignedAgents.length === 0 && (
                    <span className="text-muted-foreground text-sm">No agents assigned</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={assignedAgents.includes(agent.id)}
                        onCheckedChange={() => handleAgentToggle(agent.id)}
                      />
                      <Label htmlFor={`agent-${agent.id}`} className="text-sm cursor-pointer">
                        {agent.name} ({agent.role}) - {agent.district || 'No district'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter any special instructions for this lead..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadDialog;
