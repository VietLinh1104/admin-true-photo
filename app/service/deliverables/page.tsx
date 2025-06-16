'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import ListLayout from '@/app/components/ListLayout';
import CustomDataTable from '@/app/components/DataTable';
import { getAll } from '@/lib/apiClient';
import { formatDate, formatSize } from '@/app/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { Document } from '@carbon/icons-react';
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
  id_user: string | null;
  customer_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
  file_description: string;
  Documents: Document[];
  User: User | null;
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

interface DisplayDeliverable extends Omit<Deliverable, 'created_at' | 'updated_at'> {
  createdAt: string;
  updatedAt: string;
  size: string;
}

const headers = [
  { key: 'customer_name', header: 'Customer Name' },
  { key: 'client_email', header: 'Customer Email' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'updatedAt', header: 'Updated At' },
  { key: 'file_description', header: 'File Description' },
];

const breadcrumbData = [
  { label: 'Home', href: '/' },
  { label: 'Service', href: '' },
  { label: 'Deliverables', href: '/service/deliverables', isCurrentPage: true },
];

export default function DeliverablesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('created_at');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDoc, setSelectedDoc] = useState<Deliverable | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:desc` : undefined;
        const response = await getAll<Deliverable>('deliverables-documents', page, pageSize, sortString);
        setFiles(response.data);
        setTotalItems(response.meta?.pagination?.total ?? 0);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [page, pageSize, sortKey]);

  const handlePageChange = (pageInfo: { page: number; pageSize: number }) => {
    setPage(pageInfo.page);
    setPageSize(pageInfo.pageSize);
  };

  const handleSort = (key: string) => {
    setSortKey(key);
  };

  const displayFiles = React.useMemo(() => {
    return files.map((file) => {
      const displayFile: DisplayDeliverable = {
        ...file,
        createdAt: formatDate(file.created_at),
        updatedAt: formatDate(file.updated_at),
        size: formatSize(Number(file.Documents[0]?.size || 0)),
      };

      const tableRow: TableRow = {
        id: file.id_deliverables_document,
        cells: headers.map((header) => {
          let value = file[header.key as keyof Deliverable];
          if (header.key === 'createdAt') value = displayFile.createdAt;
          if (header.key === 'updatedAt') value = displayFile.updatedAt;
          return {
            id: header.key,
            value: typeof value === 'string' || typeof value === 'number' ? value : '',
            info: { header: header.key },
          };
        }),
      };

      return { ...displayFile, ...tableRow };
    });
  }, [files]);

  return (
    <ListLayout 
      breadcrumbData={breadcrumbData}
      buttonLabel="Upload"
      onButtonClick={() => router.push('/service/deliverables/add')}
    >
      <div className="p-0 rounded-lg shadow">
        <CustomDataTable
          loading={loading}
          rows={displayFiles}
          headers={headers}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          page={page}
          sortKey={sortKey}
          onSort={handleSort}
          onRowClick={(row) => {
            router.push(`/service/deliverables/${row.id}`);
          }}
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
        onRequestSecondary={() => selectedDoc && router.push(`/service/deliverables/edit/${selectedDoc.Documents[0]?.id_document}`)}
        onRequestSubmit={() => setOpenDetail(false)}
        selectedDoc={selectedDoc as unknown as Record<string, string | number | null | undefined>}
        headers={headers}
      >
        {selectedDoc?.Documents[0] && (
          <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>File</label>
            <ClickableTile
              href={selectedDoc.Documents[0].document_url}
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
              <Document size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>{selectedDoc.Documents[0].file_name}</div>
                <div style={{ fontSize: 12, color: '#bbb' }}>{formatSize(Number(selectedDoc.Documents[0].size))}</div>
              </div>
            </ClickableTile>
          </div>
        )}
      </MultiStepModal>
    </ListLayout>
  );
}