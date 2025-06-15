
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AddLeadFormSingleStep from '@/components/admin/AddLeadFormSingleStep';
import { transformFormDataToLead } from '@/lib/form-data-transformer';
import { updateLeadInDatabase, getLeadByIdFromDatabase } from '@/lib/lead-operations';

// import locationData structure from AddNewLead or define default here
const DEFAULT_LOCATION_DATA = {
  states: [
    {
      id: 'state-1',
      name: 'Karnataka',
      districts: [
        {
          id: 'district-1',
          name: 'Bangalore Urban',
          cities: [
            { id: 'city-1', name: 'Bangalore' },
            { id: 'city-2', name: 'Electronic City' },
          ],
        },
      ],
    },
    {
      id: 'state-2',
      name: 'Maharashtra',
      districts: [
        {
          id: 'district-2',
          name: 'Mumbai',
          cities: [
            { id: 'city-3', name: 'Mumbai' },
            { id: 'city-4', name: 'Navi Mumbai' },
          ],
        },
      ],
    },
  ],
};

const EditLead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState(DEFAULT_LOCATION_DATA);

  useEffect(() => {
    // Optionally try to get locationData from localStorage for consistency with AddNewLead
    const storedLocationData = localStorage.getItem('locationData');
    if (storedLocationData) {
      try {
        setLocationData(JSON.parse(storedLocationData));
      } catch {
        setLocationData(DEFAULT_LOCATION_DATA);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadLead(id);
    }
  }, [id]);

  const loadLead = async (leadId: string) => {
    setLoading(true);
    try {
      // Fetch from database (not local)
      const found = await getLeadByIdFromDatabase(leadId);
      if (found) {
        setLead(found);
      } else {
        toast({
          title: "Error",
          description: "Lead not found",
          variant: "destructive"
        });
        navigate('/admin/leads');
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      toast({
        title: "Error",
        description: "Failed to load lead details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handler for full form submission
  const handleUpdate = async (formData: any) => {
    try {
      const updatedLead: Lead = transformFormDataToLead({ ...lead, ...formData, id: lead?.id });
      await updateLeadInDatabase(updatedLead.id, updatedLead);
      toast({
        title: "Lead updated successfully",
        description: `Lead ${updatedLead.name} has been updated.`,
      });
      navigate('/admin/leads');
    } catch (error: any) {
      toast({
        title: "Lead update failed",
        description: String(error?.message || error),
        variant: "destructive"
      });
    }
  };

  if (loading || !lead) {
    return <div className="flex items-center justify-center h-56">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit Lead</h1>
          <p className="text-muted-foreground">Update any field, including address, vehicle type, and more.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/leads')}>
          Back to Leads
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Lead Details - {lead.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddLeadFormSingleStep
            onSubmit={handleUpdate}
            locationData={locationData}
            // Add more props if AddLeadFormSingleStep supports pre-filling fields from `lead`
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLead;
