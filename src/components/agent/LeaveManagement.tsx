
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User } from '@/utils/mockData';

interface LeaveManagementProps {
  user: User;
}

// Define leave types
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  agentId: string;
  agentName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

const leaveFormSchema = z.object({
  fromDate: z.date({
    required_error: "A start date is required.",
  }),
  toDate: z.date({
    required_error: "An end date is required.",
  }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

const LeaveManagement = ({ user }: LeaveManagementProps) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    // Load leave requests for this agent
    const storedLeaves = localStorage.getItem('agentLeaves');
    if (storedLeaves) {
      try {
        const allLeaves = JSON.parse(storedLeaves);
        // Filter to only show this agent's leaves
        const agentLeaves = allLeaves.filter(
          (leave: LeaveRequest) => leave.agentId === user.id
        );
        setLeaveRequests(agentLeaves);
      } catch (error) {
        console.error("Error loading leave requests:", error);
      }
    }
  }, [user.id]);

  const form = useForm<z.infer<typeof leaveFormSchema>>({
    resolver: zodResolver(leaveFormSchema),
  });

  const onSubmit = (values: z.infer<typeof leaveFormSchema>) => {
    // Check for overlapping leave requests
    const hasOverlappingLeave = leaveRequests.some(leave => 
      leave.status !== 'Rejected' && 
      isDateRangeOverlapping(
        parseISO(leave.fromDate), 
        parseISO(leave.toDate),
        values.fromDate,
        values.toDate
      )
    );

    if (hasOverlappingLeave) {
      toast({
        title: "Overlapping leave period",
        description: "You already have a leave request during this period.",
        variant: "destructive",
      });
      return;
    }

    // Create new leave request
    const newLeaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      agentId: user.id,
      agentName: user.name,
      fromDate: values.fromDate.toISOString(),
      toDate: values.toDate.toISOString(),
      reason: values.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString(),
    };

    // Save to localStorage
    const storedLeaves = localStorage.getItem('agentLeaves');
    let allLeaves: LeaveRequest[] = [];
    
    if (storedLeaves) {
      try {
        allLeaves = JSON.parse(storedLeaves);
      } catch (error) {
        console.error("Error parsing leave data:", error);
      }
    }
    
    // Add new record
    allLeaves.push(newLeaveRequest);
    localStorage.setItem('agentLeaves', JSON.stringify(allLeaves));
    
    // Update local state
    setLeaveRequests([...leaveRequests, newLeaveRequest]);
    
    toast({
      title: "Leave request submitted",
      description: "Your leave request has been submitted for approval.",
    });
    
    form.reset();
  };

  const isDateRangeOverlapping = (
    existingStart: Date, 
    existingEnd: Date, 
    newStart: Date, 
    newEnd: Date
  ): boolean => {
    return (
      (newStart <= existingEnd && newStart >= existingStart) ||
      (newEnd <= existingEnd && newEnd >= existingStart) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
          <CardDescription>
            Request time off for personal or medical reasons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const fromDate = form.getValues("fromDate");
                              return fromDate ? date < fromDate : date < new Date();
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Leave</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please provide details about your leave request" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit Leave Request</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>
            View status of your previous leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              You haven't submitted any leave requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((leave) => (
                <div key={leave.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {format(parseISO(leave.fromDate), "MMM d, yyyy")} - {format(parseISO(leave.toDate), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Applied on {format(parseISO(leave.appliedOn), "MMM d, yyyy")}
                      </div>
                      <div className="mt-2 text-sm">
                        {leave.reason}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(leave.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
