import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Eye, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { User, Document } from '@/utils/mockData';

interface AgentDocumentsProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const AgentDocuments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('kycUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        type: selectedDocumentType
      };

      const updatedUser = {
        ...user,
        documents: [...(user.documents || []), newDocument]
      };

      setUser(updatedUser);
      localStorage.setItem('kycUser', JSON.stringify(updatedUser));

      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });

      // Reset form
      setSelectedDocumentType('');
      event.target.value = '';
    }
  };

  const getUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem('kycUser');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ID Proof">ID Proof</SelectItem>
                <SelectItem value="Address Proof">Address Proof</SelectItem>
                <SelectItem value="Income Proof">Income Proof</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="upload">Upload Document</Label>
            <Input type="file" id="upload" onChange={handleFileUpload} />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {user.documents && user.documents.length > 0 ? (
          user.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{doc.name || 'Document'}</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {format(doc.uploadedAt, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No documents uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AgentDocuments;
