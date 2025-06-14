
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Users } from 'lucide-react';
import { User as UserType } from '@/utils/mockData';

interface Address {
  id?: string;
  type: string;
  street: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  assignedAgent?: string;
  owner?: 'applicant' | 'co-applicant';
}

interface AddressAgentAssignmentProps {
  primaryAddress: Address;
  additionalAddresses: Address[];
  coApplicantAddresses: Address[];
  agents: UserType[];
  tvtAgent?: string;
  onAssignmentChange: (assignments: {
    primaryAddress: Address;
    additionalAddresses: Address[];
    coApplicantAddresses: Address[];
    tvtAgent?: string;
  }) => void;
}

const AddressAgentAssignment = ({
  primaryAddress,
  additionalAddresses,
  coApplicantAddresses,
  agents,
  tvtAgent,
  onAssignmentChange
}: AddressAgentAssignmentProps) => {
  const [assignments, setAssignments] = useState({
    primaryAddress: { ...primaryAddress, owner: 'applicant' as const },
    additionalAddresses: additionalAddresses.map(addr => ({ ...addr, owner: 'applicant' as const })),
    coApplicantAddresses: coApplicantAddresses.map(addr => ({ ...addr, owner: 'co-applicant' as const })),
    tvtAgent: tvtAgent || ''
  });

  const fieldAgents = agents.filter(agent => agent.role === 'agent');
  const tvtAgents = agents.filter(agent => agent.role === 'tvt');

  const handleAddressAssignment = (addressType: 'primary' | 'additional' | 'coApplicant', index: number | null, agentId: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      
      if (addressType === 'primary') {
        newAssignments.primaryAddress = { ...prev.primaryAddress, assignedAgent: agentId };
      } else if (addressType === 'additional' && index !== null) {
        newAssignments.additionalAddresses = prev.additionalAddresses.map((addr, i) =>
          i === index ? { ...addr, assignedAgent: agentId } : addr
        );
      } else if (addressType === 'coApplicant' && index !== null) {
        newAssignments.coApplicantAddresses = prev.coApplicantAddresses.map((addr, i) =>
          i === index ? { ...addr, assignedAgent: agentId } : addr
        );
      }
      
      return newAssignments;
    });
  };

  const handleTvtAssignment = (agentId: string) => {
    setAssignments(prev => ({
      ...prev,
      tvtAgent: agentId
    }));
  };

  useEffect(() => {
    onAssignmentChange(assignments);
  }, [assignments, onAssignmentChange]);

  const renderAddressCard = (address: Address, title: string, owner: 'applicant' | 'co-applicant', onAssign: (agentId: string) => void) => (
    <Card key={`${owner}-${title}`} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {title}
          <Badge variant="outline" className="ml-2">
            {owner === 'applicant' ? 'Applicant' : 'Co-Applicant'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>{address.street}, {address.city}</p>
          <p>{address.district}, {address.state} - {address.pincode}</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign Field Agent</label>
          <Select
            value={address.assignedAgent || ''}
            onValueChange={onAssign}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field agent" />
            </SelectTrigger>
            <SelectContent>
              {fieldAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {agent.name} ({agent.city || 'Location not set'})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {address.assignedAgent && (
          <div className="p-2 bg-green-50 rounded border">
            <p className="text-sm text-green-800">
              ✓ Assigned to: {fieldAgents.find(a => a.id === address.assignedAgent)?.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const totalAddresses = 1 + assignments.additionalAddresses.length + assignments.coApplicantAddresses.length;
  const assignedAddresses = [
    assignments.primaryAddress.assignedAgent ? 1 : 0,
    ...assignments.additionalAddresses.map(addr => addr.assignedAgent ? 1 : 0),
    ...assignments.coApplicantAddresses.map(addr => addr.assignedAgent ? 1 : 0)
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Address-Based Agent Assignment</h3>
        <div className="flex gap-2">
          <Badge variant={assignedAddresses === totalAddresses ? "default" : "secondary"}>
            {assignedAddresses}/{totalAddresses} Addresses Assigned
          </Badge>
          <Badge variant={assignments.tvtAgent ? "default" : "secondary"}>
            TVT Agent {assignments.tvtAgent ? 'Assigned' : 'Not Assigned'}
          </Badge>
        </div>
      </div>

      {/* Primary Address */}
      {renderAddressCard(
        assignments.primaryAddress,
        `Primary Address (${assignments.primaryAddress.type || 'Residence'})`,
        'applicant',
        (agentId) => handleAddressAssignment('primary', null, agentId)
      )}

      {/* Additional Applicant Addresses */}
      {assignments.additionalAddresses.map((address, index) =>
        renderAddressCard(
          address,
          `Additional Address ${index + 1} (${address.type})`,
          'applicant',
          (agentId) => handleAddressAssignment('additional', index, agentId)
        )
      )}

      {/* Co-Applicant Addresses */}
      {assignments.coApplicantAddresses.map((address, index) =>
        renderAddressCard(
          address,
          `Co-Applicant Address ${index + 1} (${address.type})`,
          'co-applicant',
          (agentId) => handleAddressAssignment('coApplicant', index, agentId)
        )
      )}

      {/* TVT Agent Assignment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            TVT Agent Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Assign a TVT (Technical Verification Team) agent for overall verification coordination.
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign TVT Agent</label>
            <Select
              value={assignments.tvtAgent}
              onValueChange={handleTvtAssignment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select TVT agent" />
              </SelectTrigger>
              <SelectContent>
                {tvtAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {agent.name} ({agent.city || 'Location not set'})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {assignments.tvtAgent && (
            <div className="p-2 bg-blue-50 rounded border">
              <p className="text-sm text-blue-800">
                ✓ TVT Agent: {tvtAgents.find(a => a.id === assignments.tvtAgent)?.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Assignment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Total Addresses:</strong> {totalAddresses}</p>
            <p><strong>Assigned Addresses:</strong> {assignedAddresses}</p>
            <p><strong>Unassigned Addresses:</strong> {totalAddresses - assignedAddresses}</p>
            <p><strong>TVT Agent:</strong> {assignments.tvtAgent ? 'Assigned' : 'Not Assigned'}</p>
            {totalAddresses > 0 && assignedAddresses === totalAddresses && assignments.tvtAgent && (
              <div className="mt-3 p-2 bg-green-100 rounded border">
                <p className="text-green-800 font-medium">✓ All addresses and TVT agent assigned successfully!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressAgentAssignment;
