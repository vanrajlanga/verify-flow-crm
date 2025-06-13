
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileX, FileCheck, Image, User as UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { User } from '@/utils/mockData';

interface AgentDocumentsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

interface AgentDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadDate: string;
}

const AgentDocuments = ({ user, onUpdate }: AgentDocumentsProps) => {
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  
  // Get documents from user or initialize empty array
  const documents: AgentDocument[] = (user.documents || []).map(doc => ({
    id: doc.id,
    type: doc.type || 'Document',
    filename: doc.name,
    url: doc.url,
    uploadDate: doc.uploadDate.toISOString()
  }));
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;
    
    // In a real app, we would upload the file to storage
    // For this mockup, we'll create a URL and simulate the upload
    const fakeUrl = URL.createObjectURL(file);
    
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      url: fakeUrl,
      uploadDate: new Date(),
      type: selectedDocType
    };
    
    // Add document to user
    const updatedUser = {
      ...user,
      documents: [...(user.documents || []), newDocument]
    };
    
    onUpdate(updatedUser);
    
    // Update the documents in localStorage
    updateUserDocumentsInStorage(updatedUser);
    
    toast({
      title: "Document uploaded",
      description: `${selectedDocType} has been uploaded successfully.`,
    });
    
    // Reset selection
    setSelectedDocType('');
    e.target.value = '';
  };

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a URL for the profile picture
    const imageUrl = URL.createObjectURL(file);
    
    // Update user with profile picture
    const updatedUser = {
      ...user,
      profilePicture: imageUrl
    };
    
    onUpdate(updatedUser);
    
    // Update the user in localStorage
    updateUserDocumentsInStorage(updatedUser);
    
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully.",
    });
    
    e.target.value = '';
  };
  
  const handleDeleteDocument = (docId: string) => {
    // Filter out the document to delete
    const updatedDocuments = (user.documents || []).filter(doc => doc.id !== docId);
    
    // Update user
    const updatedUser = {
      ...user,
      documents: updatedDocuments
    };
    
    onUpdate(updatedUser);
    
    // Update in localStorage
    updateUserDocumentsInStorage(updatedUser);
    
    toast({
      title: "Document deleted",
      description: "The document has been removed.",
    });
  };

  const updateUserDocumentsInStorage = (updatedUser: User) => {
    // Get all users
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      try {
        const allUsers = JSON.parse(storedUsers);
        // Update specific user
        const updatedUsers = allUsers.map((u: User) => 
          u.id === user.id ? updatedUser : u
        );
        // Save back to storage
        localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
        
        // Also update the currently logged in user if it's the same
        const loggedInUser = JSON.parse(localStorage.getItem('kycUser') || '{}');
        if (loggedInUser.id === user.id) {
          localStorage.setItem('kycUser', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Error updating users in localStorage:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload or update your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 h-32 w-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <Label htmlFor="profile-picture">Upload new profile picture</Label>
              <Input 
                id="profile-picture" 
                type="file" 
                accept="image/*"
                onChange={handleProfilePicture}
              />
              <p className="text-sm text-muted-foreground">
                Recommended: Square image, at least 300x300 pixels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
          <CardDescription>
            Upload and manage your verification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="document-type">Document Type</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
              >
                <option value="">Select document type</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="document-file">Upload Document</Label>
              <Input 
                id="document-file" 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={!selectedDocType}
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <FileX className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{doc.filename}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDocuments;
