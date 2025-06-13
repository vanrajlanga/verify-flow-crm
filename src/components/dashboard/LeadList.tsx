
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Building, Calendar, Eye, Navigation } from 'lucide-react';
import { Lead, User as UserType } from '@/utils/mockData';

interface LeadListProps {
  leads: Lead[];
  currentUser: UserType;
  showActions?: boolean;
}

const LeadList = ({ leads, currentUser, showActions = true }: LeadListProps) => {
  const navigate = useNavigate();

  const handleViewLead = (leadId: string) => {
    // Navigate to appropriate lead detail page based on user role
    if (currentUser.role === 'admin') {
      navigate(`/admin/leads/${leadId}`);
    } else if (currentUser.role === 'agent') {
      navigate(`/agent/leads/${leadId}`);
    } else if (currentUser.role === 'tvt') {
      navigate(`/tvt/leads/${leadId}`);
    }
  };

  const handleNavigateToLead = (lead: Lead) => {
    if (lead.address && lead.address.street) {
      const address = `${lead.address.street}, ${lead.address.city}, ${lead.address.state} ${lead.address.pincode}`;
      const encodedAddress = encodeURIComponent(address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (status?: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No leads found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{lead.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {lead.bank || 'No bank specified'}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                {lead.verification && (
                  <Badge variant="outline" className={getVerificationStatusColor(lead.verification.status)}>
                    {lead.verification.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Age: {lead.age}</span>
              <span>•</span>
              <span>{lead.job || 'Job not specified'}</span>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {lead.address ? 
                  `${lead.address.street}, ${lead.address.city}, ${lead.address.state} ${lead.address.pincode}` 
                  : 'Address not provided'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Visit: {lead.visitType}</span>
            </div>

            {lead.verification?.startTime && (
              <div className="text-xs text-muted-foreground">
                Started: {new Date(lead.verification.startTime).toLocaleDateString()}
              </div>
            )}
            
            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleViewLead(lead.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {currentUser.role === 'agent' ? 'Start/View' : 'View Details'}
                </Button>
                
                {lead.address && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleNavigateToLead(lead)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadList;
