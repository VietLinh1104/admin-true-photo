"use client"

import React, { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { MultipartFileUploader } from '@/app/components/MultipartFileUploader';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  TextInput,
  TextArea,
  Form,
  Stack
} from '@carbon/react';
import { UploadResult } from '@uppy/core';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } =
  process.env;

export default function UploadPage() {
  const [formData, setFormData] = useState({
    description: '',
    customerName: '',
    customerEmail: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadSuccess = (result: UploadResult) => {
    console.log('Upload successful:', result);
    // After upload, send both file data and form data to the backend
    console.log('Form data:', formData);
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

        {/* Form Section */}
        <Form className="space-y-6">
          <Stack gap={6}>
            <TextInput
              id="description"
              name="description"
              labelText="File Description"
              placeholder="Enter file description"
              value={formData.description}
              onChange={handleInputChange}
            />
            
            <TextInput
              id="customerName"
              name="customerName"
              labelText="Customer Name"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={handleInputChange}
            />

            <TextInput
              id="customerEmail"
              name="customerEmail"
              type="email"
              labelText="Customer Email"
              placeholder="Enter customer email"
              value={formData.customerEmail}
              onChange={handleInputChange}
            />

            <TextArea
              id="notes"
              name="notes"
              labelText="Notes"
              placeholder="Enter additional notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
            />
          </Stack>
        </Form>

        {/* Upload Section */}
        <div>
          <MultipartFileUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </DashboardLayout>
  );
}
