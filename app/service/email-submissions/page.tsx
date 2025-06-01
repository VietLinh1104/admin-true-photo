'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import CustomDataTable from '@/app/components/DataTable';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  ClickableTile
} from '@carbon/react';
import { Document } from '@carbon/icons-react';
import { getAll } from '@/lib/strapiClient';
import { formatDate, formatSize } from '@/app/utils/dateUtils';
import MultiStepModal from '@/app/components/MultiStepModal';

interface File {
  id: string;
  fileName: string;
  size: number;
  url: string;
}

interface EmailSubmission {
  id: string;
  email: string;
  createdAt: string;
  orderStatus: string;
  files?: File[];
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

interface DisplayEmailSubmission extends Omit<EmailSubmission, 'size' | 'createdAt'> {
  size: string;
  createdAt: string;
}

const headers = [
  { key: 'email', header: 'Email' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'orderStatus', header: 'Order Status' },
];

export default function DocumentPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<EmailSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedDoc, setSelectedDoc] = useState<EmailSubmission | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:${sortDirection.toLowerCase()}` : undefined;
        const response = await getAll('client-email-submissions', '*', page, pageSize, sortString);
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

  // Map lại dữ liệu để hiển thị size và createdAt dễ đọc
  const displayFiles = React.useMemo(() => {
    return files.map((file) => {
      const displayFile: DisplayEmailSubmission = {
        ...file,
        size: formatSize(Number(file.size || 0)),
        createdAt: formatDate(file.createdAt),
      };

      const tableRow: TableRow = {
        id: file.id,
        cells: headers.map(header => {
          const value = file[header.key as keyof EmailSubmission];
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
              <BreadcrumbItem href="/service/email-submissions" isCurrentPage>
                Email Submissions 
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Email Submissions</h1>
          </div>
        </div>

        {/* List Section */}
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
          secondaryButtonText="Assign to me"
          onRequestSubmit={() => setOpenDetail(false)}
          selectedDoc={selectedDoc as unknown as Record<string, string | number | null | undefined>}
          headers={headers}
        >
          {selectedDoc?.files && selectedDoc.files.length > 0 && (
            <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Files</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedDoc.files.map((file) => (
                  <ClickableTile
                    key={file.id}
                    href={file.url}
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
                      <div style={{ fontWeight: 500 }}>{file.fileName}</div>
                      <div style={{ fontSize: 12, color: '#bbb' }}>{formatSize(Number(file.size))}</div>
                    </div>
                  </ClickableTile>
                ))}
              </div>
            </div>
          )}
        </MultiStepModal>
      </div>
    </DashboardLayout>
  );
}
