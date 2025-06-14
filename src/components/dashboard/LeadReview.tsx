import React, { useState } from 'react';
import { format } from 'date-fns';
import { Lead } from '@/utils/mockData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Camera, FileText } from 'lucide-react';

interface LeadReviewProps {
  lead: Lead;
  onApprove: (leadId: string, adminRemarks: string) => void;
  onReject: (leadId: string, adminRemarks: string) => void;
}

const LeadReview = ({ lead, onApprove, onReject }: LeadReviewProps) => {
  const [adminRemarks, setAdminRemarks] = useState(lead.verification?.adminRemarks || '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleApprove = () => {
    onApprove(lead.id, adminRemarks);
  };

  const handleReject = () => {
    onReject(lead.id, adminRemarks);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Lead Verification Review</h2>
        <p className="text-muted-foreground">Review the verification details submitted by the agent.</p>
      </div>

      {/* Verification Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Verification Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Agent</Label>
              <p className="text-sm">{lead.verification?.agentId || 'Not assigned'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant={getStatusColor(lead.verification?.status || 'Not Started')}>
                {lead.verification?.status || 'Not Started'}
              </Badge>
            </div>
            {lead.verification?.arrivalTime && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Arrival Time</Label>
                <p className="text-sm">{format(lead.verification.arrivalTime, 'PPp')}</p>
              </div>
            )}
            {lead.verification?.completionTime && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Completion Time</Label>
                <p className="text-sm">{format(lead.verification.completionTime, 'PPp')}</p>
              </div>
            )}
            {lead.verification?.reviewedAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reviewed At</Label>
                <p className="text-sm">{format(lead.verification.reviewedAt, 'PPp')}</p>
              </div>
            )}
          </div>

          {lead.verification?.notes && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Agent Notes</Label>
              <p className="text-sm bg-muted p-3 rounded">{lead.verification.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      {lead.verification?.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Latitude:</strong> {lead.verification.location.latitude}</p>
              <p className="text-sm"><strong>Longitude:</strong> {lead.verification.location.longitude}</p>
              {lead.verification.location.address && (
                <p className="text-sm"><strong>Address:</strong> {lead.verification.location.address}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {lead.verification?.photos && lead.verification.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Verification Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lead.verification.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <img 
                    src={photo.url} 
                    alt={photo.name}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <p className="text-xs text-center">{photo.name}</p>
                  <p className="text-xs text-center text-muted-foreground">
                    {format(photo.uploadedAt, 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {lead.verification?.documents && lead.verification.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lead.verification.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {format(doc.uploadedAt, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Remarks and Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="remarks" className="text-sm font-medium">Additional Notes</Label>
              <textarea
                id="remarks"
                className="w-full border rounded-md p-2 mt-1"
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Enter any additional remarks here..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleReject}>Reject</Button>
              <Button onClick={handleApprove}>Approve</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadReview;
