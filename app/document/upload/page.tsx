"use client"

import React from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { MultipartFileUploader } from '@/app/components/MultipartFileUploader';
import { 
  Breadcrumb, 
  BreadcrumbItem,
} from '@carbon/react';
import { UploadResult } from '@uppy/core';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } =
  process.env;

export default function UploadPage() {
  const handleUploadSuccess = (result: UploadResult) => {
    console.log('Upload successful:', result);
    
    // sau khi upload xong thì req post lưu dữ liệu vào strapi
  };

  return (
    <DashboardLayout>
      <div className="upload-page mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="">Document</BreadcrumbItem>

              <BreadcrumbItem href="/document/upload" isCurrentPage>
              Upload Document
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Upload Files</h1>
          </div>
        </div>

        {/* Upload Section */}
        <div className=" ">
          <MultipartFileUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </DashboardLayout>
  );
}
