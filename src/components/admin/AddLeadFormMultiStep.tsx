
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Paperclip } from 'lucide-react';
import { saveLeadToDatabase } from '@/lib/lead-operations';
import { Lead } from '@/utils/mockData';

const formSchema = z.object({
  applicantName: z.string().min(2, {
    message: "Applicant name must be at least 2 characters.",
  }),
  applicantAge: z.number().optional().nullable(),
  applicantPhone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  applicantEmail: z.string().email({
    message: "Invalid email address.",
  }),
  dateOfBirth: z.string().optional(),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  workExperience: z.string().optional(),
  monthlyIncome: z.string().optional(),
  annualIncome: z.string().optional(),
  otherIncome: z.string().optional(),
  residenceAddress: z.string().min(5, {
    message: "Residence address must be at least 5 characters.",
  }),
  residenceCity: z.string().optional(),
  residenceDistrict: z.string().optional(),
  residenceState: z.string().optional(),
  residencePincode: z.string().min(6, {
    message: "Pincode must be at least 6 characters.",
  }),
  officeAddress: z.string().optional(),
  officeCity: z.string().optional(),
  officeDistrict: z.string().optional(),
  officeState: z.string().optional(),
  officePincode: z.string().optional(),
  permanentAddress: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentState: z.string().optional(),
  permanentPincode: z.string().optional(),
  bankName: z.string().optional(),
  visitType: z.enum(['Residence', 'Office', 'Both']).default('Residence'),
  productType: z.string().optional(),
  productTypeId: z.string().optional(),
  loanAmount: z.string().optional(),
  loanType: z.string().optional(),
  vehicleBrand: z.string().optional(),
  vehicleBrandId: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleModelId: z.string().optional(),
  buildBranch: z.string().optional(),
  schemeDescription: z.string().optional(),
  additionalComments: z.string().optional(),
  instructions: z.string().optional(),
  agencyFileNo: z.string().optional(),
  applicationId: z.string().optional(),
  caseId: z.string().optional(),
  propertyType: z.string().optional(),
  propertyOwnership: z.string().optional(),
  propertyAge: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AddLeadFormMultiStep = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      applicantAge: 0,
      applicantPhone: "",
      applicantEmail: "",
      residenceAddress: "",
      residenceCity: "",
      residenceDistrict: "",
      residenceState: "",
      residencePincode: "",
      visitType: "Residence",
    },
    mode: "onChange"
  });

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files).map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadDate: new Date()
      }));
      setUploadedDocuments([...uploadedDocuments, ...newDocuments]);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Generate a unique lead ID
      const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the complete lead object
      const leadData: Lead = {
        id: leadId,
        name: data.applicantName,
        age: data.applicantAge || 0,
        job: data.designation || '',
        address: {
          street: data.residenceAddress || '',
          city: data.residenceCity || '',
          district: data.residenceDistrict || '',
          state: data.residenceState || '',
          pincode: data.residencePincode || ''
        },
        additionalDetails: {
          agencyFileNo: data.agencyFileNo || '',
          applicationBarcode: data.applicationId || '',
          caseId: data.caseId || '',
          phoneNumber: data.applicantPhone || '',
          email: data.applicantEmail || '',
          dateOfBirth: data.dateOfBirth || '',
          company: data.companyName || '',
          designation: data.designation || '',
          workExperience: data.workExperience || '',
          propertyType: data.propertyType || '',
          ownershipStatus: data.propertyOwnership || '',
          propertyAge: data.propertyAge || '',
          monthlyIncome: data.monthlyIncome || '',
          annualIncome: data.annualIncome || '',
          otherIncome: data.otherIncome || '',
          leadType: data.productType || '',
          leadTypeId: data.productTypeId || '',
          loanAmount: data.loanAmount || '',
          loanType: data.loanType || '',
          vehicleBrandName: data.vehicleBrand || '',
          vehicleBrandId: data.vehicleBrandId || '',
          vehicleModelName: data.vehicleModel || '',
          vehicleModelId: data.vehicleModelId || '',
          bankBranch: data.buildBranch || '',
          schemeDesc: data.schemeDescription || '',
          additionalComments: data.additionalComments || '',
          addresses: [
            {
              type: 'Office' as const,
              street: data.officeAddress || '',
              city: data.officeCity || '',
              district: data.officeDistrict || '',
              state: data.officeState || '',
              pincode: data.officePincode || ''
            },
            {
              type: 'Permanent' as const,
              street: data.permanentAddress || '',
              city: data.permanentCity || '',
              district: data.permanentDistrict || '',
              state: data.permanentState || '',
              pincode: data.permanentPincode || ''
            }
          ]
        },
        status: 'Pending',
        bank: data.bankName || '',
        visitType: data.visitType || 'Residence',
        assignedTo: '',
        createdAt: new Date(),
        documents: uploadedDocuments,
        instructions: data.instructions || '',
        verification: {
          id: `verification-${leadId}`,
          leadId: leadId,
          status: 'Not Started',
          agentId: '',
          photos: [],
          documents: [],
          notes: ''
        }
      };

      console.log('Saving lead data:', leadData);

      // Save to database
      try {
        await saveLeadToDatabase(leadData);
        console.log('Lead saved to database successfully');
      } catch (dbError) {
        console.error('Database save failed, saving to localStorage:', dbError);
        
        // Fallback to localStorage
        const existingLeads = localStorage.getItem('mockLeads');
        const leads = existingLeads ? JSON.parse(existingLeads) : [];
        leads.push(leadData);
        localStorage.setItem('mockLeads', JSON.stringify(leads));
        console.log('Lead saved to localStorage successfully');
      }

      toast({
        title: "Lead Created Successfully",
        description: `Lead ${leadData.name} has been created with ID: ${leadId}`,
      });

      // Reset form and navigate back
      form.reset();
      setCurrentStep(1);
      setUploadedDocuments([]);
      navigate('/admin/leads');

    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:container md:mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
          <CardDescription>
            Fill in the details to create a new lead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(currentStep / 4) * 100} className="mb-4" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Applicant Information</h3>
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Applicant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicantAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Applicant age"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicantPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Applicant phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicantEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Applicant email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Date of Birth"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Employment Information</h3>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Designation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="Work experience" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income</FormLabel>
                        <FormControl>
                          <Input placeholder="Annual income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="otherIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Income</FormLabel>
                        <FormControl>
                          <Input placeholder="Other income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Address Information</h3>
                  <FormField
                    control={form.control}
                    name="residenceAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Residence address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residenceCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence City</FormLabel>
                        <FormControl>
                          <Input placeholder="Residence city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residenceDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence District</FormLabel>
                        <FormControl>
                          <Input placeholder="Residence district" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residenceState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence State</FormLabel>
                        <FormControl>
                          <Input placeholder="Residence state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residencePincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Residence pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Office address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officeCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office City</FormLabel>
                        <FormControl>
                          <Input placeholder="Office city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officeDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office District</FormLabel>
                        <FormControl>
                          <Input placeholder="Office district" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officeState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office State</FormLabel>
                        <FormControl>
                          <Input placeholder="Office state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officePincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Office pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Permanent address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent City</FormLabel>
                        <FormControl>
                          <Input placeholder="Permanent city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent District</FormLabel>
                        <FormControl>
                          <Input placeholder="Permanent district" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent State</FormLabel>
                        <FormControl>
                          <Input placeholder="Permanent state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentPincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Permanent pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Additional Information</h3>
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Residence">Residence</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Product type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Product type ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="Loan amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Loan type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleBrand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleBrandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Brand ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle brand ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleModelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle model ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buildBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Build Branch</FormLabel>
                        <FormControl>
                          <Input placeholder="Build branch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schemeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheme Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Scheme description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments</FormLabel>
                        <FormControl>
                          <Input placeholder="Additional comments" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agencyFileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency File No</FormLabel>
                        <FormControl>
                          <Input placeholder="Agency File No" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Application ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Case ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Upload Documents</FormLabel>
                    <Input
                      type="file"
                      multiple
                      onChange={onFileUpload}
                      id="upload"
                      className="hidden"
                    />
                    <Button asChild variant="outline" onClick={() => document.getElementById('upload')?.click()}>
                      <label htmlFor="upload" className="cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Upload Documents
                      </label>
                    </Button>
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-2">
                        {uploadedDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                              {doc.name}
                            </a>
                            <span className="text-xs text-muted-foreground">{doc.uploadDate.toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button variant="secondary" onClick={handlePrevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadFormMultiStep;
