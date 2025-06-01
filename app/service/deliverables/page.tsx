'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import CustomDataTable from '@/app/components/DataTable';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  Button,
  ClickableTile
} from '@carbon/react';
import { Document, Upload } from '@carbon/icons-react';
import { getAll } from '@/lib/strapiClient';
import { formatDate, formatSize } from '@/app/utils/dateUtils';
import MultiStepModal from '@/app/components/MultiStepModal';
import { useRouter } from 'next/navigation';

interface StorageBucket {
  id: string;
  fileName: string;
  size: number;
  url: string;
}

interface Deliverable {
  id: string;
  documentId: string;
  customerName: string;
  customerEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  fileDescription: string;
  storage_bucket?: StorageBucket;
  size?: number;
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

interface DisplayDeliverable extends Omit<Deliverable, 'size' | 'createdAt' | 'updatedAt'> {
  size: string;
  createdAt: string;
  updatedAt: string;
}

const headers = [
  { key: 'customerName', header: 'Customer Name' },
  { key: 'customerEmail', header: 'Customer Email' },
  { key: 'notes', header: 'Notes' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'updatedAt', header: 'Updated At' },
  { key: 'fileDescription', header: 'File Description' },
];

export default function DocumentPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedDoc, setSelectedDoc] = useState<Deliverable | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:${sortDirection.toLowerCase()}` : undefined;
        const response = await getAll('deliverables-documents', '*', page, pageSize, sortString);
        setFiles(response.data);
        setTotalItems(response.meta.pagination.total);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [page, pageSize, sortKey, sortDirection]);

  const handlePageChange = (pageInfo: { page: number; pageSize: number }) => {
    setPage(pageInfo.page);
    setPageSize(pageInfo.pageSize);
  };

  const handleSort = (key: string) => {
    setSortKey(key);
  };

  const handleUpload = () => {
    router.push('/service/deliverables/add');
  };

  // Map lại dữ liệu để hiển thị size và createdAt dễ đọc
  const displayFiles = React.useMemo(() => {
    return files.map((file) => {
      const displayFile: DisplayDeliverable = {
        ...file,
        size: formatSize(Number(file.size || 0)),
        createdAt: formatDate(file.createdAt),
        updatedAt: formatDate(file.updatedAt),
      };

      const tableRow: TableRow = {
        id: file.id,
        cells: headers.map(header => {
          const value = file[header.key as keyof Deliverable];
          return {
            id: header.key,
            value: typeof value === 'string' || typeof value === 'number' ? value : '',
            info: { header: header.key }
          };
        })
      };

      return { ...displayFile, ...tableRow };
    });
  }, [files]);

  return (
    <DashboardLayout>
      <div className="document-page mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/deliverables" isCurrentPage>
                Deliverables 
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Deliverables</h1>
          </div>
        </div>

        {/* List Section */}
        <div className="p-0 rounded-lg shadow">
          <div className="flex justify-end">
            <Button onClick={handleUpload}>
              <Upload size={16} />
              <span className="ml-2 text-sm">Upload</span>
            </Button>
          </div>
          <CustomDataTable
            loading={loading}
            rows={displayFiles}
            headers={headers}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            page={page}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(row) => {
              const doc = files.find((f) => f.id === row.id);
              if (doc) {
                setSelectedDoc(doc);
                setOpenDetail(true);
              }
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
          onRequestSecondary={() => selectedDoc && router.push(`/service/deliverables/edit/${selectedDoc.documentId}`)}
          onRequestSubmit={() => setOpenDetail(false)}
          selectedDoc={selectedDoc as unknown as Record<string, string | number | null | undefined>}
          headers={headers}
        >
          {selectedDoc?.storage_bucket && (
            <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>File</label>
              <ClickableTile
                href={selectedDoc.storage_bucket.url}
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
                  <div style={{ fontWeight: 500 }}>{selectedDoc.storage_bucket.fileName}</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>{formatSize(Number(selectedDoc.storage_bucket.size))}</div>
                </div>
              </ClickableTile>
            </div>
          )}
        </MultiStepModal>
      </div>
    </DashboardLayout>
  );
}
