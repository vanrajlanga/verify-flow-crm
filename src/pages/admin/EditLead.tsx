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

// Convert Lead object to FormData shape (esp. documents field)
function leadToFormData(lead: Lead): any {
  // Map lead fields to formData fields by best effort
  const formData: any = {
    bankName: lead.bank ?? "",
    name: lead.name ?? "",
    phoneNumbers: [
      {
        type: "Mobile",
        number: lead.phone ?? "",
        isPrimary: true,
      }
    ],
    addresses: [
      {
        type: lead.address.type ?? "Residence",
        addressLine1: lead.address.street ?? "",
        city: lead.address.city ?? "",
        district: lead.address.district ?? "",
        state: lead.address.state ?? "",
        pincode: lead.address.pincode ?? "",
      }
    ],
    hasCoApplicant: lead.hasCoApplicant ?? false,
    coApplicantName: lead.coApplicantName ?? "",
    documents: {}, // will convert below
    // Additional mappings as needed
    instructions: lead.instructions ?? "",
    bankProduct: lead.additionalDetails?.bankProduct ?? "",
    initiatedUnderBranch: lead.additionalDetails?.initiatedUnderBranch ?? "",
    // etc. Add more fields as needed for better prefill
  };

  // Documents: convert array [] into an object shape
  if (Array.isArray(lead.documents)) {
    lead.documents.forEach((doc: any) => {
      // Use doc.type or doc.name or doc.id as key
      const docKey = doc.type || doc.name || doc.id || "document";
      formData.documents[docKey] = null; // No File object for existing docs; just placeholder
    });
  }

  // Attempt to fill other important fields for edit experience
  // Try to extract coApplicantPhone if possible
  if (
    lead.additionalDetails?.coApplicant &&
    typeof lead.additionalDetails.coApplicant.phone === "string"
  ) {
    formData.coApplicantPhone = lead.additionalDetails.coApplicant.phone;
  }
  // Merge in anything from additionalDetails
  if (lead.additionalDetails) {
    formData.company = lead.additionalDetails.company ?? "";
    formData.designation = lead.additionalDetails.designation ?? "";
    formData.workExperience = lead.additionalDetails.workExperience ?? "";
    formData.monthlyIncome = (lead.additionalDetails.monthlyIncome ?? "").toString();
    formData.officeAddress = {
      addressLine1: "", // These can be mapped if available in details
      city: "",
      district: "",
      state: "",
      pincode: "",
    };
    formData.propertyType = lead.additionalDetails.propertyType ?? "";
    formData.ownershipStatus = lead.additionalDetails.ownershipStatus ?? "";
    formData.propertyAge = lead.additionalDetails.propertyAge ?? "";
    formData.vehicleType = lead.vehicleType ?? "";
    formData.vehicleBrand = lead.additionalDetails.vehicleBrandName ?? "";
    formData.vehicleModel = lead.additionalDetails.vehicleModelName ?? "";
    formData.annualIncome = lead.additionalDetails.annualIncome ?? "";
    formData.otherIncome = lead.additionalDetails.otherIncome ?? "";
    // ...add more as needed
  }

  return formData;
}

const EditLead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState(DEFAULT_LOCATION_DATA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    // eslint-disable-next-line
  }, [id]);

  const loadLead = async (leadId: string) => {
    setLoading(true);
    setError(null);
    try {
      const found = await getLeadByIdFromDatabase(leadId);
      if (found) {
        setLead(found);
        setError(null);
      } else {
        setLead(null);
        setError("Lead not found. Please check the link or try again from the leads list.");
        toast({
          title: "Error",
          description: "Lead not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      setError("Failed to load lead details. Please try again later.");
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
      // Merge updated data with the previous lead
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

  if (loading) {
    return <div className="flex items-center justify-center h-56">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl">
          <strong className="font-bold">Error:</strong>&nbsp; {error}
        </div>
        <Button className="mt-6" variant="outline" onClick={() => navigate('/admin/leads')}>
          Back to Leads
        </Button>
      </div>
    );
  }

  if (!lead) {
    // This should not happen, but fallback just in case
    return <div className="flex items-center justify-center h-56">No lead data found.</div>;
  }

  // Convert lead to partial FormData to pass as defaultValues
  const formDefaultValues = leadToFormData(lead);

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
            // Pass current lead data as defaultValues to prefill the form (now transformed)
            defaultValues={formDefaultValues}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLead;
