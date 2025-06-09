'use client';

import * as React from 'react';
import PageLayout from '@/app/components/PageLayout';
import {
  Tile,
  TextInput,
  ClickableTile,
  Button,
  Modal
} from '@carbon/react';
import { AddAlt, Information } from '@carbon/icons-react';
import { MultipartFileUploader } from '@/app/components/MultipartFileUploader2';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { formatSize, formatDate } from '@/app/utils/dateUtils';
import { User, Document, RequestClient } from '@/app/types/models';
import { getOne, deleteDocument, remove } from '@/lib/apiClient';
import MultiStepModal from '@/app/components/MultiStepModal';



const Dataheaders = [
  { key: 'fullname', header: 'Size' },
  { key: 'email', header: 'Created At' },
  { key: 'phone_number', header: 'Updated At' },
  { key: 'address', header: 'Address' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
  { key: 'request_status', header: 'Request Status' },
  { key: 'processing_request_details', header: 'Processing Request Details' }
];

// Fetch data
const breadcrumbData = [
  { label: 'Home', href: '/' },
  { label: 'Document', href: '' },
  { label: 'List Document', href: '/document/document-list', isCurrentPage: true }
];

export default function DocumentPage() {
  const params = useParams();
  const id = params.id;
  const [headers, setHeaders] = useState(Dataheaders);
  const [dataClient ,setDataClient] = useState<RequestClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const triggerUploadRef = React.useRef<(() => Promise<string>) | null>(null);

    const handleConfirmDelete = async () => {
        if (selectedFile) {
            await handleDeleteDocument(selectedFile);
            setOpenConfirmDelete(false);
        }
    };


  // fetch data
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (typeof id === 'string' || typeof id === 'number') {
          const res = await getOne<RequestClient>('request-clients', id);
          setDataClient(res.data); // Set the entire data object
          console.log(res.data); // Set only the data property
        } else {
          setError('Invalid or missing ID parameter.');
        }
        
      } catch (err) {
        setError((err as Error).message);
      }
    };
    

    fetchUsers();

  }, []);

    // Unified delete document handler
    const handleDeleteDocument = async (document: Document) => {
      try {
        if (!document.key || !document.id_document) {
          console.error('Invalid document data for deletion');
          return;
        }

        console.log(`Deleting document with key: ${document.key} and id: ${document.id_document}`);

        // Delete from storage
        const storageResponse = await deleteDocument(document.key);
        if (!storageResponse.success) {
          console.error('Failed to delete document from storage:', storageResponse.message);
          return;
        }

        // Delete from database
        const dbResponse = await remove('documents', document.id_document);
        console.log('Document deleted successfully:', dbResponse.message);

        // Update state to remove the deleted document
        setDataClient((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            Documents: prevData.Documents.filter((doc) => doc.id_document !== document.id_document),
          };
        });

        setOpenDetail(false);
      } catch (error) {
        console.error('Error while deleting document:', error);
      }
    }; // Added missing closing brace

  const documentHeaders = [
    { key: 'file_name', header: 'File Name' },
    { key: 'size', header: 'Size' },
    { key: 'document_url', header: 'Document URL' },
    { key: 'key', header: 'Key' },
    { key: 'created_at', header: 'Created At' },
    { key: 'updated_at', header: 'Updated At' },
  ];



  // console.log('Fetched data:', dataClient);


  return (
    <PageLayout breadcrumbData={breadcrumbData}>

      {/* Header */}
      <Tile className = "mb-4">
        <h1 className="text-base font-bold mb-4">Document List</h1>
        
        {/* Client Request Details */}
        <div className="grid grid-cols-2 gap-4 mt-6">

            {/* Left Section: Client Request Details */}
            <div className="col-span-2">

              {/* field */}
              <div className="grid grid-cols-2 gap-4 bg-[#262626] rounded-md">
                  {dataClient && headers ? (
                  headers.map(h => (
                      <TextInput
                      key={h.key}
                      id={h.key}
                      labelText={h.header}
                      value={
                          h.key === 'size'
                          ? formatSize(Number((dataClient as any)[h.key]))
                          : ['created_at', 'updated_at', 'publishedAt'].includes(h.key)
                              ? formatDate((dataClient as any)[h.key])
                              : String((dataClient as any)[h.key] ?? '')
                      }
                      readOnly
                      style={{
                          marginBottom: 16,
                          backgroundColor: '#393939',
                          border: 'none',
                          borderBottom: '1px solid #494A4C',
                          width: '100%',
                      }}
                      />
                  ))
                  ) : (
                  <p className="text-gray-500">No data available</p>
                  )}
              </div>

              
            </div>

            
        </div>
      </Tile>


      <Tile>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-base font-bold">Document List</h1>
          <Button
            kind="ghost"
            renderIcon={AddAlt}
            iconDescription="Add document"
            onClick={() => setOpenUpload(true)}
            hasIconOnly
            tooltipAlignment="center"
            size="sm"
          />
        </div>

        {/* Documents Section */}
        <div className="flex flex-col gap-3">
            <label className="cds--label pb-0">Documents</label>
            {dataClient && dataClient.Documents && dataClient.Documents.length > 0 ? (
            dataClient.Documents.map((file) => (
                <div key={file.id_document} className="flex items-center gap-3">
                <ClickableTile
                  onClick={() => {
                    setSelectedFile(file);
                    setOpenDetail(true);
                  }}
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: '#393939',
                    color: '#fff',
                    padding: 12,
                    minHeight: 48,
                    flex: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={24} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{file.file_name}</div>
                      <div style={{ fontSize: 12, color: '#bbb' }}>{formatSize(Number(file.size))}</div>
                    </div>
                  </div>
                  {/* Detail icon on the right */}
                  <Information size={20} style={{ color: '#bbb' }} />
                </ClickableTile>
                </div>
            ))
            ) : (
            <p className="text-gray-500">No documents available</p>
            )}
        </div>

        {/* MultiStepModal */}
        <MultiStepModal
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          steps={[{ label: 'Document Details' }]}
          currentStep={0}
          modalHeading="Document Details"
          secondaryButtonText="Delete"
          onRequestSecondary={() => {
            if (selectedFile) {
              setOpenConfirmDelete(true);
            }
          }}
          primaryButtonText="Download"
          onRequestSubmit={() => {
              if (selectedFile) {
              window.open(selectedFile.document_url, '_blank');
              }
          }}
          selectedDoc={selectedFile as unknown as Record<string, string | number | null | undefined>}
          headers={documentHeaders}
        />

        {/* Confirmation Modal */}
        <Modal
          open={openConfirmDelete}
          modalHeading="Confirm Deletion"
          primaryButtonText="Delete"
          secondaryButtonText="Cancel"
          onRequestSubmit={handleConfirmDelete}
          onRequestClose={() => setOpenConfirmDelete(false)}
          size="sm"
        >
          <p>Are you sure you want to delete this document?</p>
        </Modal>

        {/* MultiStepModal */}
        <Modal
          open={openUpload}
          modalHeading="Upload Document"
          primaryButtonText="Upload"
          secondaryButtonText="Close"
          onRequestSubmit={() => {
            if (triggerUploadRef.current) {
                triggerUploadRef.current()
                    .then((docId) => {
                    console.log('Upload successful, documentId:', docId);
                    // You can add additional logic here if needed
                    setOpenUpload(false);
                    window.location.reload();
                    })
                    .catch((err) => {
                    console.error('Upload failed:', err);
                    });
            }
          }}
          onRequestClose={() => setOpenUpload(false)}
          size="sm"
          preventCloseOnClickOutside={false}
          style={{ padding: 0, width: '100%', maxWidth: 'none' }}
        > 

            <MultipartFileUploader
              theme="dark"
              onUploadSuccess={(result) => {
                console.log('upload/page.tsx received : ', result);
              }}
              triggerUploadRef={triggerUploadRef} // Pass the ref here
              idRequestClient={Array.isArray(id) ? id[0] : id} // Ensure id is a string
              // onUploadComplete={() => setBtnDisabled(false)} 
            />
        </Modal>

      </Tile>
    </PageLayout>
  );
}

