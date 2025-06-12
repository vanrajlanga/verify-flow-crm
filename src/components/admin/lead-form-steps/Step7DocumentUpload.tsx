
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Upload } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  file: File | null;
  fileName: string;
}

const Step7DocumentUpload = () => {
  const { control } = useFormContext();
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', title: 'PAN Card', file: null, fileName: '' },
    { id: '2', title: 'Aadhar Card', file: null, fileName: '' }
  ]);

  const documentTypes = [
    'PAN Card',
    'Aadhar Card',
    'Passport',
    'Driving License',
    'Voter ID',
    'Bank Statement',
    'Salary Slip',
    'Income Certificate',
    'Property Documents',
    'Other'
  ];

  const addDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: '',
      file: null,
      fileName: ''
    };
    setDocuments([...documents, newDocument]);
  };

  const removeDocument = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const updateDocument = (id: string, field: keyof Document, value: any) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateDocument(id, 'file', file);
      updateDocument(id, 'fileName', file.name);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 7: Document Upload</CardTitle>
        <CardDescription>Upload required documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {documents.map((document, index) => (
          <div key={document.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Document {index + 1}</h4>
              {documents.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDocument(document.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Document Title</Label>
                <Select 
                  value={document.title} 
                  onValueChange={(value) => updateDocument(document.id, 'title', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Upload File</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileChange(document.id, e)}
                    className="hidden"
                    id={`file-${document.id}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const fileInput = window.document.getElementById(`file-${document.id}`) as HTMLInputElement;
                      fileInput?.click();
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {document.fileName || 'Choose File'}
                  </Button>
                </div>
                {document.fileName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {document.fileName}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addDocument} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add More Document
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>Supported file formats: PDF, JPG, JPEG, PNG, DOC, DOCX</p>
          <p>Maximum file size: 10MB per file</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step7DocumentUpload;
