
// This is a partial update for the specific error on lines 491-506
// Check if document is a string and handle accordingly
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
        <span>{typeof doc === 'string' ? 'Document' : format(doc.uploadDate, 'MMM d, yyyy')}</span>
      </a>
    </div>
  </li>
));
