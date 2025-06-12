
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { User } from '@/utils/mockData';

interface Step9Props {
  agents: User[];
}

const Step9AgentAssignment = ({ agents }: Step9Props) => {
  const { control, watch } = useFormContext();
  const selectedAgent = watch('assignedAgent');

  const getSelectedAgentDetails = () => {
    return agents.find(agent => agent.id === selectedAgent);
  };

  const selectedAgentDetails = getSelectedAgentDetails();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 9: Agent Assignment</CardTitle>
        <CardDescription>Assign agent and review</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="assignedAgent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Agent</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent to assign" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{agent.name}</span>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant="outline">{agent.city}</Badge>
                          <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAgentDetails && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-medium mb-3">Selected Agent Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {selectedAgentDetails.name}</p>
                <p><strong>Email:</strong> {selectedAgentDetails.email}</p>
                <p><strong>Phone:</strong> {selectedAgentDetails.phone}</p>
              </div>
              <div>
                <p><strong>Location:</strong> {selectedAgentDetails.city}, {selectedAgentDetails.state}</p>
                <p><strong>District:</strong> {selectedAgentDetails.district}</p>
                <p><strong>Status:</strong> 
                  <Badge variant={selectedAgentDetails.status === 'Active' ? 'default' : 'secondary'} className="ml-2">
                    {selectedAgentDetails.status}
                  </Badge>
                </p>
              </div>
              <div className="md:col-span-2">
                <p><strong>Total Verifications:</strong> {selectedAgentDetails.totalVerifications || 0}</p>
                <p><strong>Completion Rate:</strong> {selectedAgentDetails.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Note:</strong> Once assigned, the agent will receive a notification about this lead.</p>
          <p>You can change the agent assignment later if needed from the lead management page.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step9AgentAssignment;
