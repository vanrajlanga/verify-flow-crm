import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Eye, X, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadDate: Date | string;
  size?: number;
}

interface DocumentViewerProps {
  documents: Document[];
  title?: string;
}

const DocumentViewer = ({ documents, title = "Documents" }: DocumentViewerProps) => {
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const getFileIcon = (fileName: string, type?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const fileType = type?.toLowerCase();
    
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon className="h-5 w-5" />;
    }
    
    if (extension === 'pdf' || fileType === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    
    return <FileText className="h-5 w-5" />;
  };

  const isImageFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  const isPdfFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  };

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = (doc: Document) => {
    // In a real application, this would download the actual file
    // For now, we'll create a simple download simulation
    const link = window.document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">No documents available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="grid gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.name, doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{doc.type}</span>
                        {doc.size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(doc.uploadDate)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        Uploaded by: {doc.uploadedBy}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview: {previewDocument?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewDocument(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[400px]">
            {previewDocument && (
              <>
                {isImageFile(previewDocument.name) ? (
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.name}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : isPdfFile(previewDocument.name) ? (
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-red-500" />
                    <div>
                      <p className="text-lg font-medium">PDF Document</p>
                      <p className="text-sm text-muted-foreground">{previewDocument.name}</p>
                      <Button
                        className="mt-4"
                        onClick={() => window.open(previewDocument.url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Document Preview</p>
                      <p className="text-sm text-muted-foreground">
                        Preview not available for this file type
                      </p>
                      <p className="text-sm text-muted-foreground">{previewDocument.name}</p>
                      <Button
                        className="mt-4"
                        onClick={() => handleDownload(previewDocument)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentViewer;
