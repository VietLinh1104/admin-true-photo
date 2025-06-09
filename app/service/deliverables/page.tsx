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
  { key: 'customer_name', header: 'Customer Name' },
  { key: 'client_email', header: 'Customer Email' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
  { key: 'file_description', header: 'File Description' },
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
        const mappedFiles = response.data.map((item: any) => ({
          id_deliverables_document: item.id_deliverables_document,
          customer_name: item.customer_name,
          client_email: item.client_email,
          created_at: item.created_at,
          updated_at: item.updated_at,
          file_description: item.file_description,
          Documents: item.Documents,
          User: item.User,
        }));
        setFiles(mappedFiles);
        setTotalItems(response.meta.pagination.total);
      } catch (error) {
        console.error('Error fetching data:', error);
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
        size: formatSize(Number(file.Documents[0]?.size || 0)),
        createdAt: formatDate(file.created_at),
        updatedAt: formatDate(file.updated_at),
      };

      const tableRow: TableRow = {
        id: file.id_deliverables_document,
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
              const doc = files.find((f) => f.id_deliverables_document === row.id);
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
      </div>
    </DashboardLayout>
  );
}
