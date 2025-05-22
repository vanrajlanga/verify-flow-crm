
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { User } from '@/utils/mockData';

interface CheckInOutProps {
  user: User;
}

interface AttendanceRecord {
  id: string;
  agentId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

const CheckInOut = ({ user }: CheckInOutProps) => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  
  useEffect(() => {
    // Load today's attendance record
    const storedAttendance = localStorage.getItem('agentAttendance');
    if (storedAttendance) {
      try {
        const allAttendance = JSON.parse(storedAttendance);
        // Find today's record for current agent
        const todayRecord = allAttendance.find(
          (record: AttendanceRecord) => 
            record.agentId === user.id && 
            record.date === currentDate
        );
        
        if (todayRecord) {
          setTodayAttendance(todayRecord);
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
      }
    }
  }, [user.id, currentDate]);
  
  const handleCheckIn = () => {
    setLoading(true);
    
    setTimeout(() => {
      const now = new Date();
      const timeStr = format(now, 'HH:mm:ss');
      
      // Create new attendance record
      const newAttendance: AttendanceRecord = {
        id: `att-${Date.now()}`,
        agentId: user.id,
        date: currentDate,
        checkInTime: timeStr,
        checkOutTime: null
      };
      
      // Save to localStorage
      const storedAttendance = localStorage.getItem('agentAttendance');
      let allAttendance = [];
      
      if (storedAttendance) {
        try {
          allAttendance = JSON.parse(storedAttendance);
        } catch (error) {
          console.error("Error parsing attendance:", error);
        }
      }
      
      // Add new record
      allAttendance.push(newAttendance);
      localStorage.setItem('agentAttendance', JSON.stringify(allAttendance));
      
      setTodayAttendance(newAttendance);
      setLoading(false);
      
      toast({
        title: "Checked in successfully",
        description: `You checked in at ${timeStr}`,
      });
    }, 1000);
  };
  
  const handleCheckOut = () => {
    if (!todayAttendance) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const now = new Date();
      const timeStr = format(now, 'HH:mm:ss');
      
      // Update existing record
      const storedAttendance = localStorage.getItem('agentAttendance');
      if (storedAttendance) {
        try {
          const allAttendance = JSON.parse(storedAttendance);
          
          const updatedAttendance = allAttendance.map((record: AttendanceRecord) => {
            if (record.id === todayAttendance.id) {
              return { ...record, checkOutTime: timeStr };
            }
            return record;
          });
          
          localStorage.setItem('agentAttendance', JSON.stringify(updatedAttendance));
          
          // Update local state
          setTodayAttendance({
            ...todayAttendance,
            checkOutTime: timeStr
          });
          
          toast({
            title: "Checked out successfully",
            description: `You checked out at ${timeStr}`,
          });
        } catch (error) {
          console.error("Error updating attendance:", error);
        }
      }
      
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Today: {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              {todayAttendance?.checkInTime && (
                <p className="text-sm text-muted-foreground">
                  Check in time: {todayAttendance.checkInTime}
                </p>
              )}
              {todayAttendance?.checkOutTime && (
                <p className="text-sm text-muted-foreground">
                  Check out time: {todayAttendance.checkOutTime}
                </p>
              )}
            </div>
            
            {!todayAttendance ? (
              <Button 
                onClick={handleCheckIn} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Check In
              </Button>
            ) : !todayAttendance.checkOutTime ? (
              <Button 
                onClick={handleCheckOut} 
                disabled={loading}
                variant="destructive"
              >
                Check Out
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInOut;
