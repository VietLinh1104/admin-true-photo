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
import { useRouter } from 'next/navigation';

interface Document {
  id_document: string;
  id_request_client: string;
  id_deliverables_document: string | null;
  file_name: string;
  key: string;
  bucket_name: string;
  document_url: string;
  size: string;  // note: API trả size là string
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

interface RequestClient {
  id_request_client: string;
  id_user: string | null;
  fullname: string;
  email: string;
  phone_number: string;
  address: string;
  processing_request_details: string;
  request_status: string;
  created_at: string;
  updated_at: string;
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

interface DisplayRequestClient extends Omit<RequestClient, 'created_at'> {
  createdAt: string;
}

const headers = [
  { key: 'fullname', header: 'Fullname' },
  { key: 'email', header: 'Email' },
  { key: 'phone_number', header: 'Phone Number' },
  { key: 'address', header: 'Address' },
  { key: 'request_status', header: 'Request Status' },
  { key: 'createdAt', header: 'Created At' },
];

export default function DocumentPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<RequestClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('created_at'); // đổi thành key API trả về
  const [selectedDoc, setSelectedDoc] = useState<RequestClient | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:desc` : undefined;
        const response = await getAll('request-clients', '*', page, pageSize, sortString);
        setFiles(response.data);
        setTotalItems(response.meta.pagination.total);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
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
      // chuyển created_at thành createdAt đã format
      const displayFile: DisplayRequestClient = {
        ...file,
        createdAt: formatDate(file.created_at),
      };

      const tableRow: TableRow = {
        id: file.id_request_client,
        cells: headers.map(header => {
          let value = file[header.key as keyof RequestClient];
          if (header.key === 'createdAt') value = displayFile.createdAt; // lấy giá trị format
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
              <BreadcrumbItem href="/service/client-requests" isCurrentPage>
                Client Requests 
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Client Requests</h1>
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
            onSort={handleSort}
            onRowClick={(row) => {
              const doc = files.find((f) => f.id_request_client === row.id);
              if (doc) {
                router.push(`/service/client-requests/${row.id}`);
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
          {selectedDoc?.Documents && selectedDoc.Documents.length > 0 && (
            <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Files</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedDoc.Documents.map((file) => (
                  <ClickableTile
                    key={file.id_document}
                    href={file.document_url}
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
                      <div style={{ fontWeight: 500 }}>{file.file_name}</div>
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
