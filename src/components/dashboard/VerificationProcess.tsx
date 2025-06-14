import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead } from '@/utils/mockData';
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Clock, MapPin, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationProcessProps {
  lead: Lead;
  onStartVerification: () => void;
  onMarkArrival: () => void;
  onUploadPhoto: (files: FileList) => void;
  onUploadDocument: (files: FileList, type: string) => void;
  onAddNotes: (notes: string) => void;
  onCompleteVerification: () => void;
}

const DOCUMENT_TYPES = [
  'Aadhaar Card',
  'PAN Card', 
  'Salary Slip',
  'Bank Statement',
  'Property Documents',
  'Income Tax Returns',
  'Other'
] as const;

const VerificationProcess = ({
  lead,
  onStartVerification,
  onMarkArrival,
  onUploadPhoto,
  onUploadDocument,
  onAddNotes,
  onCompleteVerification
}: VerificationProcessProps) => {
  const [notes, setNotes] = useState(lead.verification?.notes || '');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('Other');
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(
    lead.verification?.location || null
  );
  const [locationPermission, setLocationPermission] = useState(false);

  const verification = lead.verification;
  const status = verification?.status || 'Not Started';

  const formatTime = (date?: Date) => {
    if (!date) return '—';
    return format(new Date(date), 'h:mm a, MMM d, yyyy');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadPhoto(e.target.files);
    }
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadDocument(e.target.files, selectedDocumentType);
    }
  };

  const handleMarkArrival = () => {
    if (locationPermission) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(location);
          onMarkArrival();
        },
        (error) => {
          console.error("Error getting location:", error);
          onMarkArrival();
        }
      );
    } else {
      onMarkArrival();
    }
  };

  const isStepCompleted = (step: string) => {
    switch (step) {
      case 'start':
        return !!verification?.startTime;
      case 'arrival':
        return !!verification?.arrivalTime;
      case 'documents':
        return verification?.photos?.length! > 0 || verification?.documents?.length! > 0;
      case 'complete':
        return !!verification?.completionTime;
      default:
        return false;
    }
  };

  const hasVerificationPhotos = verification?.photos && verification.photos.length > 0;
  const hasVerificationDocuments = verification?.documents && verification.documents.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Verification Process</h2>
        
        {/* Step 1: Start Verification */}
        <div className={`verification-step ${isStepCompleted('start') ? 'verification-step-completed' : ''}`}>
          <div className="flex items-start">
            <div className={`timeline-dot ${isStepCompleted('start') ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {isStepCompleted('start') ? (
                <Clock className="h-5 w-5" />
              ) : (
                <span className="text-sm">1</span>
              )}
            </div>
            <div className="ml-4 space-y-2">
              <h3 className="font-medium">Start Verification</h3>
              {verification?.startTime ? (
                <p className="text-sm text-muted-foreground">
                  Started at {formatTime(verification.startTime)}
                </p>
              ) : (
                <Button onClick={onStartVerification}>Start Verification</Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Mark Arrival */}
        <div className={`verification-step ${isStepCompleted('arrival') ? 'verification-step-completed' : ''}`}>
          <div className="flex items-start">
            <div className={`timeline-dot ${isStepCompleted('arrival') ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {isStepCompleted('arrival') ? (
                <MapPin className="h-5 w-5" />
              ) : (
                <span className="text-sm">2</span>
              )}
            </div>
            <div className="ml-4 space-y-2">
              <h3 className="font-medium">Check In at Location</h3>
              {verification?.arrivalTime ? (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Arrived at {formatTime(verification.arrivalTime)}
                  </p>
                  {location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {verification?.startTime && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="location-permission" 
                          checked={locationPermission}
                          onCheckedChange={(checked) => setLocationPermission(checked as boolean)}
                        />
                        <label 
                          htmlFor="location-permission"
                          className="text-sm cursor-pointer"
                        >
                          Allow location access for accurate check-in
                        </label>
                      </div>
                      <Button onClick={handleMarkArrival} disabled={!verification?.startTime}>
                        Check In at Location
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Verify Lead Data */}
        <div className="verification-step">
          <div className="flex items-start">
            <div className="timeline-dot bg-muted text-muted-foreground">
              <span className="text-sm">3</span>
            </div>
            <div className="ml-4 space-y-2">
              <h3 className="font-medium">Verify All Lead Data</h3>
              {verification?.arrivalTime ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Data Verification Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verify-personal" />
                      <label htmlFor="verify-personal">Verify personal information (Name, Age, Contact)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verify-address" />
                      <label htmlFor="verify-address">Verify address details</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verify-employment" />
                      <label htmlFor="verify-employment">Verify employment/business details</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verify-income" />
                      <label htmlFor="verify-income">Verify income information</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verify-property" />
                      <label htmlFor="verify-property">Verify property/asset details (if applicable)</label>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Please check in at the location first</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Upload Photos & Documents */}
        <div className={`verification-step ${isStepCompleted('documents') ? 'verification-step-completed' : ''}`}>
          <div className="flex items-start">
            <div className={`timeline-dot ${verification?.photos?.length! > 0 || verification?.documents?.length! > 0 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {verification?.photos?.length! > 0 || verification?.documents?.length! > 0 ? (
                <Camera className="h-5 w-5" />
              ) : (
                <span className="text-sm">4</span>
              )}
            </div>
            <div className="ml-4 space-y-4">
              <h3 className="font-medium">Upload Photos & Documents</h3>
              
              {verification?.arrivalTime && (
                <div className="space-y-6">
                  {/* Photos Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Verification Photos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {hasVerificationPhotos ? (
                        verification.photos.map((photo) => (
                          <div key={photo.id} className="border rounded-md p-2">
                            <div className="w-full h-32 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={photo.url} 
                                alt={photo.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <p className="text-xs mt-2 break-words">{photo.name}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-full">No photos uploaded yet</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Required Photos:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2 text-muted-foreground">
                        <li>Applicant's residence/office front view</li>
                        <li>Applicant with agent (selfie if possible)</li>
                        <li>Property/business premises (if applicable)</li>
                        <li>Address verification proof at location</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="outline" className="w-full" asChild>
                          <label className="cursor-pointer">
                            <Camera className="h-4 w-4 mr-2" />
                            <span>Upload Photos</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              className="hidden" 
                              onChange={handlePhotoUpload}
                            />
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">KYC Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {hasVerificationDocuments ? (
                        verification.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-md p-2">
                            <div className="w-full h-32 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                              {doc.url.endsWith('.pdf') ? (
                                <FileText className="h-12 w-12 text-gray-400" />
                              ) : (
                                <img 
                                  src={doc.url} 
                                  alt={doc.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              )}
                            </div>
                            <p className="text-xs mt-2 break-words font-medium">{(doc as any).type || 'Document'}</p>
                            <p className="text-xs text-muted-foreground">{doc.name}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-full">No documents uploaded yet</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Document Type:</label>
                        <Select value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Required Documents:</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2 text-muted-foreground">
                          <li>Aadhaar Card (Identity Proof)</li>
                          <li>PAN Card (Tax Identification)</li>
                          <li>Salary Slip / Business License (Income Proof)</li>
                          <li>Bank Statement (Financial Verification)</li>
                          <li>Property Documents (Asset Verification)</li>
                          <li>Income Tax Returns (Tax Records)</li>
                        </ul>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          <span>Upload {selectedDocumentType}</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            multiple 
                            className="hidden" 
                            onChange={handleDocumentUpload}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Verification Notes & Observations</h4>
                    <Textarea 
                      placeholder="Add detailed verification notes, observations, and any concerns or recommendations here..."
                      className="min-h-32"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={() => onAddNotes(notes)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include details about the verification process, applicant cooperation, document authenticity, and any red flags or positive observations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Complete Verification */}
        <div className="verification-step">
          <div className="flex items-start">
            <div className={`timeline-dot ${isStepCompleted('complete') ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {isStepCompleted('complete') ? (
                <Clock className="h-5 w-5" />
              ) : (
                <span className="text-sm">5</span>
              )}
            </div>
            <div className="ml-4 space-y-2">
              <h3 className="font-medium">Submit Verification Report</h3>
              {verification?.completionTime ? (
                <p className="text-sm text-muted-foreground">
                  Completed at {formatTime(verification.completionTime)}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ensure all verification steps are completed before submitting the report.
                  </p>
                  <Button 
                    onClick={onCompleteVerification}
                    disabled={!verification?.arrivalTime || (!verification?.photos?.length && !verification?.documents?.length)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Verification Report
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcess;
