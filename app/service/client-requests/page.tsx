'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import ListLayout from '@/app/components/ListLayout';
import CustomDataTable from '@/app/components/DataTable';
import { getAll } from '@/lib/apiClient';
import { formatDate } from '@/app/utils/dateUtils';
import { useRouter } from 'next/navigation';

interface Document {
  id_document: string;
  id_request_client: string;
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

const breadcrumbData = [
  { label: 'Home', href: '/' },
  { label: 'Service', href: '' },
  { label: 'Client Requests', href: '/service/client-requests', isCurrentPage: true },
];

export default function DocumentPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [files, setFiles] = useState<RequestClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortKey, setSortKey] = useState('created_at');
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const sortString = sortKey ? `${sortKey}:desc` : undefined;
        const response = await getAll<RequestClient>('request-clients', page, pageSize, sortString);
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
      const displayFile: DisplayRequestClient = {
        ...file,
        createdAt: formatDate(file.created_at),
      };

      const tableRow: TableRow = {
        id: file.id_request_client,
        cells: headers.map((header) => {
          let value = file[header.key as keyof RequestClient];
          if (header.key === 'createdAt') value = displayFile.createdAt;
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
      buttonDisabled={true}
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
            router.push(`/service/client-requests/${row.id}`);
          }}
        />
      </div>
    </ListLayout>
  );
}