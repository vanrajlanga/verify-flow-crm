
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';
import { getLeadById, getUserById, getBankById } from '@/utils/mockData';

// Helper functions
const getBadgeColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'PAN':
    case 'Aadhar':
    case 'Voter ID':
    case 'Job ID':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// LeadDetail component
const LeadDetail = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const lead = getLeadById(leadId || '');
  
  if (!lead) {
    return <div className="p-6">Lead not found</div>;
  }

  // Document list rendering
  const documentsList = lead.documents?.map((doc, index) => (
    <li key={typeof doc === 'string' ? doc : doc.id} className="mb-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getBadgeColor('default')}`}>
          {typeof doc === 'string' ? 
            <FileText className="h-4 w-4" /> : 
            getDocumentIcon(doc.type)
          }
        </div>
        <span className="ml-3 font-medium">
          {typeof doc === 'string' ? doc : doc.name}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <a 
          href={typeof doc === 'string' ? '#' : doc.url} 
          target="_blank" 
          className="text-blue-500 hover:underline flex items-center"
          download={typeof doc === 'string' ? '' : doc.name}
        >
          <Download className="h-4 w-4 mr-1" />
          <span>{typeof doc === 'string' ? 'Document' : format(new Date(doc.uploadDate), 'MMM d, yyyy')}</span>
        </a>
      </div>
    </li>
  ));

  return (
    <div className="p-6">
      <h1>Lead Detail Page</h1>
      {/* Display lead information */}
      <div>{lead.name}</div>
      {/* Display documents list */}
      <div>
        <h2>Documents</h2>
        <ul>
          {documentsList}
        </ul>
      </div>
    </div>
  );
};

export default LeadDetail;
