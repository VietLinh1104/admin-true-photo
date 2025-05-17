'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import FileList from '@/app/components/FileList';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  DataTableSkeleton,
  Button 
} from '@carbon/react';
import { Upload } from '@carbon/icons-react';
import Link from 'next/link';
import { getAll } from '@/lib/strapiClient';

export default function DocumentPage() {
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const headers = [
    { key: 'fileName', header: 'File Name' },
    { key: 'documentId', header: 'Document ID' },
    { key: 'size', header: 'Size' },
    { key: 'mimeType', header: 'Type' },
    { key: 'statusUpload', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
  ];

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const data = await getAll('storage-buckets');
        setFiles(data);
        setTotalItems(data.length);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [page]);

  const handleUploadClick = () => {
    window.location.href = '/document/upload';
  };

  return (
    <DashboardLayout>
      <div className="document-page mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="">Document</BreadcrumbItem>
              <BreadcrumbItem href="/document/document-list" isCurrentPage>
                List Document
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Document</h1>
          </div>
          <Button
            renderIcon={Upload}
            onClick={handleUploadClick}
          >
            Upload Document
          </Button>
        </div>

        {/* List Section */}
        <div className="p-0 rounded-lg shadow">
          {loading ? (
            <DataTableSkeleton 
              className="bg-black !p-0"
              rowCount={2} 
              columnCount={7} 
              headers={headers}
              showHeader={false}
              showToolbar={false}
            />
          ) : (
            <FileList
              files={files}
              loading={loading}
              page={page}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
