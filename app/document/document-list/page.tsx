'use client';

import React, { useState, useEffect } from 'react';
import ListLayout from '@/app/components/ListLayout';
import CustomDataTable from '@/app/components/DataTable';
import { getAll } from '@/lib/apiClient';
import { formatDate, formatSize } from '@/app/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { Document as DocumentIcon } from '@carbon/icons-react';
import { ClickableTile } from '@carbon/react';
import MultiStepModal from '@/app/components/MultiStepModal';

interface Document {
  id_document: string;
  id_request_client: string | null;
  id_deliverables_document: string | null;
  file_name: string;
  key: string;
  bucket_name: string;
  document_url: string;
  size: string;
  mine_type: string;
  status_upload: string;
  created_at: string;
  updated_at: string;
  DeliverablesDocument?: {
    id_deliverables_document: string;
    customer_name: string;
    client_email: string;
    file_description: string;
    created_at: string;
    updated_at: string;
  } | null;
  RequestClient?: {
    id_request_client: string;
    fullname: string;
    email: string;
    phone_number: string;
    address: string;
    request_status: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface TableCell {
  id: string;
  value: string | number;
  info?: {
    header: string;
  };
}

interface TableRow {
  id: string;
  cells: TableCell[];
}

interface DisplayDocument extends Omit<Document, 'created_at' | 'updated_at' | 'size'> {
  createdAt: string;
  updatedAt: string;
  size: string;
}

const headers = [
  { key: 'file_name', header: 'File Name' },
  { key: 'mine_type', header: 'File Type' },
  { key: 'size', header: 'Size' },
  { key: 'status_upload', header: 'Upload Status' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'updatedAt', header: 'Updated At' },
];

const breadcrumbData = [
  { label: 'Home', href: '/' },
  { label: 'Service', href: '' },
  { label: 'Documents', href: '/service/documents', isCurrentPage: true },
];

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('created_at');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:desc` : undefined;
        const response = await getAll<Document>('documents', page, pageSize, sortString);
        const mappedDocuments = response.data.map((item: any) => ({
          id_document: item.id_document,
          id_request_client: item.id_request_client,
          id_deliverables_document: item.id_deliverables_document,
          file_name: item.file_name,
          key: item.key,
          bucket_name: item.bucket_name,
          document_url: item.document_url,
          size: item.size,
          mine_type: item.mine_type,
          status_upload: item.status_upload,
          created_at: item.created_at,
          updated_at: item.updated_at,
          DeliverablesDocument: item.DeliverablesDocument,
          RequestClient: item.RequestClient,
        }));
        setDocuments(mappedDocuments);
        setTotalItems(response.meta.pagination.total);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [page, pageSize, sortKey]);

  const handlePageChange = (pageInfo: { page: number; pageSize: number }) => {
    setPage(pageInfo.page);
    setPageSize(pageInfo.pageSize);
  };

  const handleSort = (key: string) => {
    setSortKey(key);
  };

  const handleRowClick = (row: TableRow) => {
    const doc = documents.find((d) => d.id_document === row.id);
    if (doc) {
      if (doc.id_deliverables_document) {
        router.push(`/service/deliverables/${doc.id_deliverables_document}`);
      } else if (doc.id_request_client) {
        router.push(`/service/client-requests/${doc.id_request_client}`);
      } else {
        setSelectedDoc(doc);
        setOpenDetail(true);
      }
    }
  };

  const displayDocuments = React.useMemo(() => {
    return documents.map((doc) => {
      const displayDoc: DisplayDocument = {
        ...doc,
        createdAt: formatDate(doc.created_at),
        updatedAt: formatDate(doc.updated_at),
        size: formatSize(Number(doc.size)),
      };

      const tableRow: TableRow = {
        id: doc.id_document,
        cells: headers.map((header) => {
          let value = doc[header.key as keyof Document];
          if (header.key === 'createdAt') value = displayDoc.createdAt;
          if (header.key === 'updatedAt') value = displayDoc.updatedAt;
          if (header.key === 'size') value = displayDoc.size;
          return {
            id: header.key,
            value: typeof value === 'string' || typeof value === 'number' ? value : '',
            info: { header: header.key },
          };
        }),
      };

      return { ...displayDoc, ...tableRow };
    });
  }, [documents]);

  return (
    <ListLayout
      breadcrumbData={breadcrumbData}
      buttonLabel="Upload Document"
      onButtonClick={() => router.push('/service/documents/add')}
    >
      <div className="p-0 rounded-lg shadow">
        <CustomDataTable
          loading={loading}
          rows={displayDocuments}
          headers={headers}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          page={page}
          sortKey={sortKey}
          onSort={handleSort}
          onRowClick={handleRowClick}
        />
      </div>

      <MultiStepModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        steps={[{ label: 'Document Details' }]}
        currentStep={0}
        modalHeading="Document Details"
        primaryButtonText="Close"
        secondaryButtonText="Edit"
        onRequestSecondary={() => selectedDoc && router.push(`/service/documents/edit/${selectedDoc.id_document}`)}
        onRequestSubmit={() => setOpenDetail(false)}
        selectedDoc={selectedDoc as unknown as Record<string, string | number | null | undefined>}
        headers={headers}
      >
        {selectedDoc && (
          <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Document</label>
            <ClickableTile
              href={selectedDoc.document_url}
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#262626',
                color: '#fff',
                padding: 12,
                minHeight: 48,
              }}
            >
              <DocumentIcon size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>{selectedDoc.file_name}</div>
                <div style={{ fontSize: 12, color: '#bbb' }}>{formatSize(Number(selectedDoc.size))}</div>
              </div>
            </ClickableTile>
          </div>
        )}
        {selectedDoc?.DeliverablesDocument && (
          <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Deliverables</label>
            <ClickableTile
              href={`/service/deliverables/${selectedDoc.DeliverablesDocument.id_deliverables_document}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#262626',
                color: '#fff',
                padding: 12,
                minHeight: 48,
              }}
            >
              <DocumentIcon size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>{selectedDoc.DeliverablesDocument.customer_name}</div>
                <div style={{ fontSize: 12, color: '#bbb' }}>{selectedDoc.DeliverablesDocument.client_email}</div>
              </div>
            </ClickableTile>
          </div>
        )}
        {selectedDoc?.RequestClient && (
          <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Request Client</label>
            <ClickableTile
              href={`/service/client-requests/${selectedDoc.RequestClient.id_request_client}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#262626',
                color: '#fff',
                padding: 12,
                minHeight: 48,
              }}
            >
              <DocumentIcon size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>{selectedDoc.RequestClient.fullname}</div>
                <div style={{ fontSize: 12, color: '#bbb' }}>{selectedDoc.RequestClient.email}</div>
              </div>
            </ClickableTile>
          </div>
        )}
      </MultiStepModal>
    </ListLayout>
  );
}