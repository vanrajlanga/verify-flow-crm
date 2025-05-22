
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO, isWithinInterval } from 'date-fns';
import { LeaveRequest, LeaveStatus } from '@/components/agent/LeaveManagement';
import { User } from '@/utils/mockData';

const LeaveManagementAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [agents, setAgents] = useState<User[]>([]);

  useEffect(() => {
    // Load leave requests
    const storedLeaves = localStorage.getItem('agentLeaves');
    if (storedLeaves) {
      try {
        const allLeaves = JSON.parse(storedLeaves);
        setLeaveRequests(allLeaves);
      } catch (error) {
        console.error("Error loading leave requests:", error);
      }
    }
    
    // Load agents from localStorage
    const storedAgents = localStorage.getItem('mockUsers');
    if (storedAgents) {
      try {
        const parsedAgents = JSON.parse(storedAgents);
        setAgents(parsedAgents.filter((user: User) => user.role === 'agent'));
      } catch (error) {
        console.error("Error parsing agents:", error);
      }
    }
  }, []);

  const handleStatusChange = (leaveId: string, newStatus: LeaveStatus) => {
    const updatedLeaves = leaveRequests.map(leave => 
      leave.id === leaveId ? { ...leave, status: newStatus } : leave
    );
    
    // Save to localStorage
    localStorage.setItem('agentLeaves', JSON.stringify(updatedLeaves));
    
    // Update state
    setLeaveRequests(updatedLeaves);
    
    toast({
      title: "Leave request updated",
      description: `Leave request status changed to ${newStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            Manage and approve agent leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No leave requests submitted yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.agentName}</TableCell>
                    <TableCell>{format(parseISO(leave.fromDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(parseISO(leave.toDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                      {leave.status === 'Approved' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Approved
                        </Badge>
                      )}
                      {leave.status === 'Rejected' && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleStatusChange(leave.id, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleStatusChange(leave.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {leave.status !== 'Pending' && (
                        <span className="text-sm text-muted-foreground">
                          No actions available
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagementAdmin;
