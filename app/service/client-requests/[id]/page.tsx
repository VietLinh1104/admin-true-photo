'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import PageLayout from '@/app/components/PageLayout';
import {
  Tile,
  TextInput,
  ClickableTile,
  Button,
  Modal,
} from '@carbon/react';
import { AddAlt, Information, UserFollow } from '@carbon/icons-react';
import { MultipartFileUploader } from '@/app/components/MultipartFileUploader2';
import { useRouter, useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { formatSize, formatDate } from '@/app/utils/dateUtils';
import { Document, RequestClient } from '@/app/types/models';
import { getOne, deleteDocument, remove } from '@/lib/apiClient';
import MultiStepModal from '@/app/components/MultiStepModal';
import ConfirmModal from '@/app/components/ConfirmModal';

interface UploadData {
  id_document?: string;
  id_request_client?: string;
  id_deliverables_document?: string;
  file_name: string;
  key: string;
  bucket_name: string;
  document_url: string;
  size: number;
  mine_type: string;
  status_upload: 'success' | 'error';
}

const Dataheaders: { key: keyof RequestClient; header: string }[] = [
  { key: 'fullname', header: 'Full Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone_number', header: 'Phone Number' },
  { key: 'address', header: 'Address' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
  { key: 'request_status', header: 'Request Status' },
  { key: 'processing_request_details', header: 'Processing Request Details' },
];


export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [headers] = useState(Dataheaders);
  const [dataClient, setDataClient] = useState<RequestClient | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openConfirmDeleteRequest, setOpenConfirmDeleteRequest] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const triggerUploadRef = useRef<(() => Promise<UploadData>) | null>(null);

  const breadcrumbData = [
    { label: 'Home', href: '/' },
    { label: 'Service', href: '' },
    { label: 'Client Requests', href: '/service/client-requests' },
    {
      label: dataClient?.fullname || 'Request Details',
      href: `/service/client-requests/${Array.isArray(id) ? id[0] : id || ''}`,
      isCurrentPage: true,
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (typeof id === 'string' || typeof id === 'number') {
          const res = await getOne<RequestClient>('request-clients', id);
          setDataClient(res.data);
        } else {
          setError('Invalid or missing ID parameter.');
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchUsers();
  }, [id]);

  const handleConfirmDelete = async () => {
    if (selectedFile) {
      await handleDeleteDocument(selectedFile);
      setOpenConfirmDelete(false);
    }
  };

  const handleConfirmDeleteRequest = async () => {
    if (typeof id !== 'string') return;
    try {
      await remove('request-clients', id);
      router.push('/service/client-requests');
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Failed to delete the request. Please try again later.');
    }
    setOpenConfirmDeleteRequest(false);
  };

  const handleConfirmUpload = async () => {
    if (triggerUploadRef.current) {
      try {
        const uploadData = await triggerUploadRef.current();
        const newDocument: Document = {
          id_document: uploadData.id_document || '',
          file_name: uploadData.file_name,
          size: String(uploadData.size),
          document_url: uploadData.document_url,
          key: uploadData.key,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id_request_client: Array.isArray(id) ? id[0] : id || '',
          id_deliverables_document: uploadData.id_deliverables_document || null,
          bucket_name: uploadData.bucket_name,
          mine_type: uploadData.mine_type,
          status_upload: uploadData.status_upload,
        };

        setDataClient((prevData) =>
          prevData ? {
            ...prevData,
            Documents: [...(prevData.Documents || []), newDocument],
          } : prevData
        );

        setOpenUpload(false);
        setCanUpload(false);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      if (!document.key || !document.id_document) return;
      const storageResponse = await deleteDocument(document.key);
      if (!storageResponse.success) return;
      await remove('documents', document.id_document);
      setDataClient((prevData) =>
        prevData ? {
          ...prevData,
          Documents: (prevData.Documents || []).filter(
            (doc) => doc.id_document !== document.id_document
          ),
        } : prevData
      );
      setOpenDetail(false);
    } catch (error) {
      console.error('Error while deleting document:', error);
    }
  };

  const handleAssignToMe = () => {
    console.log(`Assigning request ${dataClient?.id_request_client} to current user`);
  };

  const documentHeaders = [
    { key: 'file_name', header: 'File Name' },
    { key: 'size', header: 'Size' },
    { key: 'document_url', header: 'Document URL' },
    { key: 'key', header: 'Key' },
    { key: 'created_at', header: 'Created At' },
    { key: 'updated_at', header: 'Updated At' },
  ];

  const documents = dataClient?.Documents || [];

  return (
    <PageLayout
      breadcrumbData={breadcrumbData}
      buttonLabel="Assign to me"
      buttonIcon={UserFollow}
      buttonOnClick={handleAssignToMe}
      buttonDisabled={true}
      menuItems={[
        {
          itemText: 'Delete Request',
          onClick: () => setOpenConfirmDeleteRequest(true),
          isDelete: true,
        },
      ]}
    >
      <Tile className="mb-4">
        <h1 className="text-base font-bold mb-4">Client Details</h1>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4 bg-[#262626] rounded-md">
              {dataClient && headers.length > 0 ? (
                headers.map((h) => (
                  <TextInput
                    key={h.key}
                    id={h.key}
                    labelText={h.header}
                    value={
                      ['created_at', 'updated_at'].includes(h.key)
                        ? formatDate(dataClient?.[h.key] as string)
                        : String(dataClient?.[h.key] ?? '')
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
            // disabled={true}
            renderIcon={AddAlt}
            iconDescription="Add document"
            onClick={() => setOpenUpload(true)}
            hasIconOnly
            tooltipAlignment="center"
            size="sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="cds--label pb-0">Documents</label>
          {documents.length > 0 ? (
            documents.map((file) => (
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
                      <div style={{ fontSize: 12, color: '#bbb' }}>
                        {formatSize(Number(file.size))}
                      </div>
                    </div>
                  </div>
                  <Information size={20} style={{ color: '#bbb' }} />
                </ClickableTile>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No documents available</p>
          )}
        </div>

        <MultiStepModal
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          steps={[{ label: 'Document Details' }]}
          currentStep={0}
          modalHeading="Document Details"
          secondaryButtonText="Close"

          
          // onRequestSecondary={() => setOpenConfirmDelete(true)}
          onRequestSecondary={() => setOpenDetail(false)}
          primaryButtonText="Download"
          onRequestSubmit={() => selectedFile && window.open(selectedFile.document_url, '_blank')}
          selectedDoc={selectedFile as unknown as Record<string, string | number | null | undefined>}
          headers={documentHeaders}
        />

        <ConfirmModal
          open={openConfirmDelete}
          heading="Confirm Deletion"
          message="Are you sure you want to delete this document?"
          primaryButtonText="Delete"
          secondaryButtonText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setOpenConfirmDelete(false)}
        />

        <ConfirmModal
          open={openConfirmDeleteRequest}
          heading="Confirm Deletion"
          message="Are you sure you want to delete this request client?"
          primaryButtonText="Delete"
          secondaryButtonText="Cancel"
          onConfirm={handleConfirmDeleteRequest}
          onCancel={() => setOpenConfirmDeleteRequest(false)}
        />

        <Modal
          open={openUpload}
          modalHeading="Upload Document"
          primaryButtonText="Upload"
          secondaryButtonText="Close"
          primaryButtonDisabled={!canUpload}
          onRequestSubmit={handleConfirmUpload}
          onRequestClose={() => {
            setOpenUpload(false);
            setCanUpload(false);
          }}
          size="sm"
          preventCloseOnClickOutside={false}
          style={{ padding: 0, width: '100%', maxWidth: 'none' }}
        >
          <MultipartFileUploader
            theme="dark"
            onUploadSuccess={() => {}}
            onFileAdded={() => setCanUpload(true)}
            onFileRemoved={() => setCanUpload(false)}
            triggerUploadRef={triggerUploadRef}
            idRequestClient={Array.isArray(id) ? id[0] : id}
          />
        </Modal>
      </Tile>
    </PageLayout>
  );
}
