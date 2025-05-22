
import { useState, useEffect } from 'react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { User } from '@/utils/mockData';
import { Badge } from "@/components/ui/badge";
import { DateRange } from 'react-day-picker';

interface AttendanceRecord {
  id: string;
  agentId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

const AttendanceReports = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  useEffect(() => {
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
    
    // Load attendance records
    const storedAttendance = localStorage.getItem('agentAttendance');
    if (storedAttendance) {
      try {
        const parsedAttendance = JSON.parse(storedAttendance);
        setAttendance(parsedAttendance);
      } catch (error) {
        console.error("Error parsing attendance records:", error);
      }
    }
  }, []);

  const getFilteredAttendance = () => {
    if (!dateRange?.from || !attendance.length) return [];
    
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      return dateRange.to ? 
        isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to }) : 
        recordDate.toDateString() === dateRange.from.toDateString();
    });
  };

  const getAgentById = (id: string): User | undefined => {
    return agents.find(agent => agent.id === id);
  };

  const getAttendanceStatusBadge = (record: AttendanceRecord) => {
    if (record.checkInTime && record.checkOutTime) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
    } else if (record.checkInTime) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Check-out Pending</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Absent</Badge>;
    }
  };
  
  const getAgentAttendanceReport = () => {
    const filteredAttendance = getFilteredAttendance();
    
    // Group by agent and date
    const reportByAgent: Record<string, {
      agent: User | undefined;
      totalDays: number;
      presentDays: number;
      partialDays: number;
      records: AttendanceRecord[];
    }> = {};
    
    filteredAttendance.forEach(record => {
      if (!reportByAgent[record.agentId]) {
        reportByAgent[record.agentId] = {
          agent: getAgentById(record.agentId),
          totalDays: 0,
          presentDays: 0,
          partialDays: 0,
          records: []
        };
      }
      
      reportByAgent[record.agentId].totalDays++;
      
      if (record.checkInTime && record.checkOutTime) {
        reportByAgent[record.agentId].presentDays++;
      } else if (record.checkInTime) {
        reportByAgent[record.agentId].partialDays++;
      }
      
      reportByAgent[record.agentId].records.push(record);
    });
    
    return Object.values(reportByAgent);
  };

  const filteredAttendance = getFilteredAttendance();
  const agentReports = getAgentAttendanceReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Attendance Reports</h2>
        <DateRangePicker 
          date={dateRange} 
          onDateChange={setDateRange} 
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent Attendance Summary</CardTitle>
          <CardDescription>
            Overview of attendance for the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentReports.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No attendance data for the selected date range</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Present Days</TableHead>
                  <TableHead>Partial Days</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentReports.map(report => (
                  <TableRow key={report.agent?.id || 'unknown'}>
                    <TableCell className="font-medium">{report.agent?.name || 'Unknown Agent'}</TableCell>
                    <TableCell>{report.presentDays}</TableCell>
                    <TableCell>{report.partialDays}</TableCell>
                    <TableCell>{report.totalDays}</TableCell>
                    <TableCell>
                      {Math.round(((report.presentDays + (report.partialDays * 0.5)) / report.totalDays) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Attendance Records</CardTitle>
          <CardDescription>
            Individual attendance entries for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No attendance data for the selected date range</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">
                      {getAgentById(record.agentId)?.name || 'Unknown Agent'}
                    </TableCell>
                    <TableCell>{record.checkInTime || '—'}</TableCell>
                    <TableCell>{record.checkOutTime || '—'}</TableCell>
                    <TableCell>{getAttendanceStatusBadge(record)}</TableCell>
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

export default AttendanceReports;
