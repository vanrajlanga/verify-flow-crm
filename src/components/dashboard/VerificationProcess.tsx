
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lead, Document } from '@/utils/mockData';
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Clock, MapPin, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationProcessProps {
  lead: Lead;
  onStartVerification: () => void;
  onMarkArrival: () => void;
  onUploadPhoto: (files: FileList) => void;
  onUploadDocument: (files: FileList, type: Document['type']) => void;
  onAddNotes: (notes: string) => void;
  onCompleteVerification: () => void;
}

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
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(
    lead.verification?.location || null
  );
  const [locationPermission, setLocationPermission] = useState(false);

  const verification = lead.verification;
  const status = verification?.status || 'Not Started';

  // Helper function to safely format dates that could be strings or Date objects
  const formatTime = (date?: Date | string) => {
    if (!date) return '—';
    // If date is a string, parse it to a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'h:mm a, MMM d, yyyy');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadPhoto(e.target.files);
    }
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: Document['type']) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadDocument(e.target.files, type);
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
          // Still allow marking arrival without location
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

  // Check if verification photos and documents exist and have elements
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
              <h3 className="font-medium">Mark Arrival at Location</h3>
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
                          Allow location access
                        </label>
                      </div>
                      <Button onClick={handleMarkArrival} disabled={!verification?.startTime}>
                        Mark Arrival
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Upload Photos & Documents */}
        <div className={`verification-step ${isStepCompleted('documents') ? 'verification-step-completed' : ''}`}>
          <div className="flex items-start">
            <div className={`timeline-dot ${verification?.photos?.length! > 0 || verification?.documents?.length! > 0 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {verification?.photos?.length! > 0 || verification?.documents?.length! > 0 ? (
                <Camera className="h-5 w-5" />
              ) : (
                <span className="text-sm">3</span>
              )}
            </div>
            <div className="ml-4 space-y-4">
              <h3 className="font-medium">Upload Photos & Documents</h3>
              
              {verification?.arrivalTime && (
                <div className="space-y-4">
                  {/* Photos Section */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Photos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {hasVerificationPhotos ? (
                        verification.photos.map((photo) => (
                          <div key={photo.id} className="border rounded-md p-2">
                            <div className="w-full h-32 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={photo.url} 
                                alt={photo.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  // If image fails to load, show backup placeholder
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <p className="text-xs mt-2 break-words">{photo.name}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">Take photos of:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>Applicant's residence/office front</li>
                        <li>Applicant with agent (selfie if possible)</li>
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
                    <h4 className="text-sm font-medium mb-2">KYC Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {hasVerificationDocuments ? (
                        verification.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-md p-2">
                            <div className="w-full h-32 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={doc.url} 
                                alt={doc.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // If document image fails to load, show backup placeholder
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <p className="text-xs mt-2 break-words">{doc.name} ({doc.type})</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">Collect and upload:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                        <li>PAN Card, Aadhar, Voter ID</li>
                        <li>Rent Agreement (if applicable)</li>
                        <li>Job ID / Salary Slip / Business License</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="outline" className="w-full" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            <span>Upload Documents</span>
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              multiple 
                              className="hidden" 
                              onChange={(e) => handleDocumentUpload(e, 'Other')}
                            />
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Agent Comments or Notes</h4>
                    <Textarea 
                      placeholder="Add your verification notes and observations here..."
                      className="min-h-24"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={() => onAddNotes(notes)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Complete Verification */}
        <div className="verification-step">
          <div className="flex items-start">
            <div className={`timeline-dot ${isStepCompleted('complete') ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              {isStepCompleted('complete') ? (
                <Clock className="h-5 w-5" />
              ) : (
                <span className="text-sm">4</span>
              )}
            </div>
            <div className="ml-4 space-y-2">
              <h3 className="font-medium">Complete Verification</h3>
              {verification?.completionTime ? (
                <p className="text-sm text-muted-foreground">
                  Completed at {formatTime(verification.completionTime)}
                </p>
              ) : (
                <Button 
                  onClick={onCompleteVerification}
                  disabled={!verification?.arrivalTime || (!verification?.photos?.length && !verification?.documents?.length)}
                >
                  Complete Verification
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcess;
