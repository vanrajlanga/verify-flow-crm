import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, User, Bank, getUserById, getBankById } from '@/utils/mockData';
import { Download, FileCheck, FileX } from 'lucide-react';
import { format } from 'date-fns';

interface LeadReviewProps {
  lead: Lead;
  currentUser: User;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
  onForwardToBank: () => void;
}

const LeadReview = ({
  lead,
  currentUser,
  onApprove,
  onReject,
  onForwardToBank
}: LeadReviewProps) => {
  const [remarks, setRemarks] = useState(lead.verification?.adminRemarks || '');
  const [agent, setAgent] = useState<User | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  
  const verification = lead.verification;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentData, bankData] = await Promise.all([
          getUserById(lead.assignedTo),
          getBankById(lead.bank)
        ]);
        setAgent(agentData);
        setBank(bankData);
      } catch (error) {
        console.error('Error loading lead review data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lead.assignedTo, lead.bank]);

  const formatDateTime = (date?: Date) => {
    return date ? format(date, 'h:mm a, MMM d, yyyy') : '—';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isReviewed = verification?.reviewedBy !== undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading review data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Review</CardTitle>
              <CardDescription>Review verification details and submit decision</CardDescription>
            </div>
            <div>
              {verification?.status && getStatusBadge(verification.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Verification Timeline */}
          <div>
            <h3 className="text-sm font-medium mb-3">Verification Timeline</h3>
            <div className="border rounded-md p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Started</p>
                  <p className="text-sm">{formatDateTime(verification?.startTime)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Arrived at Location</p>
                  <p className="text-sm">{formatDateTime(verification?.arrivalTime)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-sm">{formatDateTime(verification?.completionTime)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Reviewed</p>
                  <p className="text-sm">{formatDateTime(verification?.reviewedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div>
            <h3 className="text-sm font-medium mb-3">Agent Information</h3>
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{agent?.name || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">District</p>
                  <p className="text-sm">{agent?.district || 'Loading...'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {verification?.location && (
            <div>
              <h3 className="text-sm font-medium mb-3">Verification Location</h3>
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm">
                  Latitude: {verification.location.latitude.toFixed(6)}, 
                  Longitude: {verification.location.longitude.toFixed(6)}
                </p>
                <div className="mt-2 bg-gray-200 h-32 flex items-center justify-center rounded">
                  <p className="text-sm text-gray-500">Map Placeholder</p>
                </div>
              </div>
            </div>
          )}

          {/* Photos & Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Uploaded Photos</h3>
              {verification?.photos && verification.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {verification.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-md overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className="p-2">
                        <p className="text-xs">{photo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(photo.uploadDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">No photos uploaded</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Uploaded Documents</h3>
              {verification?.documents && verification.documents.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {verification.documents.map((doc) => (
                    <div key={doc.id} className="border rounded-md overflow-hidden">
                      <img 
                        src={doc.url} 
                        alt={doc.name} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className="p-2">
                        <p className="text-xs">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(doc.uploadDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Agent Notes */}
          {verification?.notes && (
            <div>
              <h3 className="text-sm font-medium mb-3">Agent Notes</h3>
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{verification.notes}</p>
              </div>
            </div>
          )}

          {/* Admin Review */}
          <div>
            <h3 className="text-sm font-medium mb-3">Admin Review</h3>
            <Textarea 
              placeholder="Add your review remarks here..."
              className="min-h-24"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isReviewed}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {!isReviewed ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="destructive" 
                  onClick={() => onReject(remarks)}
                  className="flex-1"
                >
                  <FileX className="mr-2 h-4 w-4" />
                  Reject Verification
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => onApprove(remarks)}
                  className="flex-1"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Approve Verification
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {verification?.status === 'Completed' && (
                  <Button onClick={onForwardToBank}>
                    Forward to {bank?.name || 'Bank'}
                  </Button>
                )}
              </div>
            )}
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadReview;
