'use client';

import React, { useState, useEffect } from 'react';
import ListLayout from '@/app/components/ListLayout';
import CustomDataTable from '@/app/components/DataTable';
import { getAll } from '@/lib/apiClient';
import { formatDate } from '@/app/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { Document } from '@carbon/icons-react';
import { ClickableTile } from '@carbon/react';
import MultiStepModal from '@/app/components/MultiStepModal';

interface User {
  id_user: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface EmailSubmission {
  id_client_email_submission: string;
  client_email: string;
  order_status: string;
  created_at: string;
  updated_at: string;
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

interface DisplayEmailSubmission extends Omit<EmailSubmission, 'created_at' | 'updated_at'> {
  createdAt: string;
  updatedAt: string;
}

const headers = [
  { key: 'client_email', header: 'Email' },
  { key: 'order_status', header: 'Order Status' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
];

const breadcrumbData = [
  { label: 'Home', href: '/' },
  { label: 'Service', href: '' },
  { label: 'Email Submissions', href: '/service/email-submissions', isCurrentPage: true },
];

export default function EmailSubmissionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<EmailSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('created_at');
  const [selectedDoc, setSelectedDoc] = useState<EmailSubmission | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:desc` : undefined;
        const response = await getAll<EmailSubmission>('email-submissions', page, pageSize, sortString);
        const mappedFiles = response.data.map((item: EmailSubmission) => ({
          id_client_email_submission: item.id_client_email_submission,
          client_email: item.client_email,
          order_status: item.order_status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          User: item.User,
        }));
        setFiles(mappedFiles);
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
      const displayFile: DisplayEmailSubmission = {
        ...file,
        createdAt: formatDate(file.created_at),
        updatedAt: formatDate(file.updated_at),
      };

      const tableRow: TableRow = {
        id: file.id_client_email_submission,
        cells: headers.map((header) => {
          let value = file[header.key as keyof EmailSubmission];
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

  const handleRowClick = (row: TableRow) => {
    const selected = files.find((file) => file.id_client_email_submission === row.id);
    if (selected) {
      setSelectedDoc(selected);
      setOpenDetail(true);
    }
  };

  return (
    <ListLayout
      breadcrumbData={breadcrumbData}
      buttonLabel="Create Submission"
      buttonDisabled={true}
      onButtonClick={() => router.push('/service/email-submissions/add')}
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
          onRowClick={handleRowClick}
        />
      </div>

      <MultiStepModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        steps={[{ label: 'Submission Details' }]}
        currentStep={0}
        modalHeading="Submission Details"
        primaryButtonText="Close"
        secondaryButtonText="Assign to me"
        onRequestSecondary={() => console.log('Assign to me clicked')} // Thay bằng logic gán user nếu cần
        onRequestSubmit={() => setOpenDetail(false)}
        selectedDoc={selectedDoc as unknown as Record<string, string | number | null | undefined>}
        headers={headers}
      >
        <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
          <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Submission Details</label>
          <div style={{ backgroundColor: '#262626', padding: 12, borderRadius: 4, color: '#fff' }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Email:</strong> {selectedDoc?.client_email || 'N/A'}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Order Status:</strong> {selectedDoc?.order_status || 'N/A'}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Created At:</strong> {selectedDoc ? formatDate(selectedDoc.created_at) : 'N/A'}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Updated At:</strong> {selectedDoc ? formatDate(selectedDoc.updated_at) : 'N/A'}
            </div>
            {selectedDoc?.User && (
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Assigned User</label>
                <ClickableTile
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: '#393939',
                    color: '#fff',
                    padding: 12,
                    minHeight: 48,
                  }}
                >
                  <Document size={24} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{selectedDoc.User.username}</div>
                    <div style={{ fontSize: 12, color: '#bbb' }}>Role: {selectedDoc.User.role}</div>
                  </div>
                </ClickableTile>
              </div>
            )}
          </div>
        </div>
      </MultiStepModal>
    </ListLayout>
  );
}