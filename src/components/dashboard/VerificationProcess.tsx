import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lead, Photo, Document } from '@/utils/mockData';
import { Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface VerificationProcessProps {
  lead: Lead;
  onStartVerification: () => void;
  onMarkArrival: () => void;
  onUploadPhoto: (files: FileList) => void;
  onUploadDocument: (files: FileList, type: string) => void;
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUploadPhoto(e.target.files);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files) {
      onUploadDocument(e.target.files, type);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    onAddNotes(notes);
    toast({
      title: "Notes Saved",
      description: "Your notes have been saved successfully.",
    });
  };

  const renderPhotos = (photos?: Photo[]) => {
    if (!photos || photos.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {photos.map(photo => (
          <div key={photo.id} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">{photo.caption}</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Photo
              </span>
            </div>
            <img 
              src={photo.url} 
              alt={photo.caption}
              className="w-full h-32 object-cover rounded-md mb-2" 
            />
          </div>
        ))}
      </div>
    );
  };

  const renderDocuments = (documents?: Document[]) => {
    if (!documents || documents.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {documents.map(doc => (
          <div key={doc.id} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">{doc.name}</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {doc.type}
              </span>
            </div>
            <img 
              src={doc.url} 
              alt={doc.name}
              className="w-full h-32 object-cover rounded-md mb-2" 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Process</CardTitle>
        <CardDescription>
          Perform verification steps and record findings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-semibold">Verification Status</h3>
            <p>{lead.verification?.status || 'Not Started'}</p>
          </div>
          <div>
            <h3 className="text-md font-semibold">Assigned Agent</h3>
            <p>{lead.assignedTo}</p>
          </div>
        </div>

        {lead.verification?.startTime && (
          <div>
            <h3 className="text-md font-semibold">Start Time</h3>
            <p>{typeof lead.verification.startTime === 'string' ? lead.verification.startTime : format(new Date(lead.verification.startTime), 'MMM d, yyyy h:mm a')}</p>
          </div>
        )}

        {lead.verification?.arrivalTime && (
          <div>
            <h3 className="text-md font-semibold">Arrival Time</h3>
            <p>{typeof lead.verification.arrivalTime === 'string' ? lead.verification.arrivalTime : format(new Date(lead.verification.arrivalTime), 'MMM d, yyyy h:mm a')}</p>
          </div>
        )}

        <div className="flex space-x-4">
          {lead.verification?.status === 'In Progress' && !lead.verification?.arrivalTime && (
            <Button onClick={onMarkArrival}>Mark Arrival</Button>
          )}
          {lead.verification?.status !== 'Completed' && lead.verification?.status !== 'In Progress' && (
            <Button onClick={onStartVerification}>Start Verification</Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="photos">Upload Photos</Label>
          <Input
            id="photos"
            type="file"
            multiple
            onChange={handlePhotoUpload}
            accept="image/*"
          />
          {renderPhotos(lead.verification?.photos)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idProof">Upload ID Proof</Label>
          <Input
            id="idProof"
            type="file"
            onChange={e => handleDocumentUpload(e, 'ID Proof')}
            accept="image/*"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressProof">Upload Address Proof</Label>
          <Input
            id="addressProof"
            type="file"
            onChange={e => handleDocumentUpload(e, 'Address Proof')}
            accept="image/*"
          />
        </div>

        {renderDocuments(lead.verification?.documents)}

        <div className="space-y-2">
          <Label htmlFor="notes">Verification Notes</Label>
          <Textarea
            id="notes"
            placeholder="Record your observations and findings"
            value={notes}
            onChange={handleNotesChange}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={handleSaveNotes}>
            Save Notes
          </Button>
          {lead.verification?.status === 'In Progress' && (
            <Button onClick={onCompleteVerification}>Complete Verification</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationProcess;
