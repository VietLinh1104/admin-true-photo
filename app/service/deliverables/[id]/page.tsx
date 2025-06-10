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
import { AddAlt, Information, UserFollow, Edit } from '@carbon/icons-react';
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

interface User {
  id_user: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Deliverable {
  id_deliverables_document: string;
  customer_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
  file_description: string;
  Documents: Document[];
  User: User | null;
}

const Dataheaders = [
  { key: 'customer_name', header: 'Customer Name' },
  { key: 'client_email', header: 'Customer Email' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
  { key: 'file_description', header: 'File Description' },
];

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [headers] = useState(Dataheaders);
  const [dataClient, setDataClient] = useState<Deliverable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openConfirmDeleteRequest, setOpenConfirmDeleteRequest] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const triggerUploadRef = useRef<(() => Promise<UploadData>) | null>(null);
  const [formState, setFormState] = useState<Partial<Deliverable>>({});


  const breadcrumbData = [
    { label: 'Home', href: '/' },
    { label: 'Service', href: '' },
    { label: 'Deliverables', href: '/service/deliverables' },
    {
      label: dataClient?.customer_name || 'Deliverable Details',
      href: `/service/deliverables/${Array.isArray(id) ? id[0] : id || ''}`,
      isCurrentPage: true,
    },
  ];

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      if (typeof id === 'string' || typeof id === 'number') {
        const res = await getOne<Deliverable>('deliverables-documents', id);
        setDataClient(res.data);
        setFormState(res.data); // đồng bộ dữ liệu vào form
      } else {
        setError('Invalid or missing ID parameter.');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };
  fetchUsers();
}, [id]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (typeof id === 'string' || typeof id === 'number') {
          const res = await getOne<Deliverable>('deliverables-documents', id);
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
      await remove('deliverables-documents', id);
      router.push('/service/deliverables');
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
          id_request_client: uploadData.id_request_client || null,
          id_deliverables_document: Array.isArray(id) ? id[0] : id || '',
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
    console.log(`Assigning request ${dataClient?.User} to current user`);
    setIsEdited(false); // Reset sau khi lưu
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
      buttonLabel="Save"
      buttonIcon={Edit}
      buttonOnClick={handleAssignToMe}
      buttonDisabled={!isEdited}
      menuItems={[
        {
          itemText: 'Delete Request',
          onClick: () => setOpenConfirmDeleteRequest(true),
          isDelete: false,
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
                    readOnly={['created_at', 'updated_at'].includes(h.key)}
                    value={
                        ['created_at', 'updated_at'].includes(h.key)
                        ? formatDate((formState as any)[h.key])
                        : String((formState as any)[h.key] ?? '')
                    }
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setFormState((prev) => ({
                        ...prev,
                        [h.key]: newValue,
                        }));
                        setIsEdited(true);
                    }}
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
          secondaryButtonText="Delete"
          onRequestSecondary={() => setOpenConfirmDelete(true)}
          primaryButtonText="Download"
          onRequestSubmit={() =>
            selectedFile && window.open(selectedFile.document_url, '_blank')
          }
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
            idDeliverablesDocument={Array.isArray(id) ? id[0] : id}
          />
        </Modal>
      </Tile>
    </PageLayout>
  );
}
