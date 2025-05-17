'use client';

import React, { useState, useEffect, use } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { MultipartFileUploader } from '@/app/components/MultipartFileUploader';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  Form,
  TextInput,
  TextArea,
  Button,
  Loading,
  Stack
} from '@carbon/react';
import { UploadResult, UppyFile } from '@uppy/core';
import { getOne, update } from '@/lib/strapiClient';

interface DeliverableFormData {
  customerName: string;
  customerEmail: string;
  fileDescription: string;
  notes: string;
}

interface ExtendedUppyFile extends UppyFile {
  uploadId?: string;
  response?: {
    body: Record<string, unknown>;
    status: number;
    uploadURL: string;
  };
  uploadURL?: string;
}

export default function EditDeliverablePage({ params }: { params: Promise<{ documentId: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DeliverableFormData>({
    customerName: '',
    customerEmail: '',
    fileDescription: '',
    notes: '',
  });

  useEffect(() => {
    const fetchDeliverable = async () => {
      try {
        const data = await getOne('deliverables-documents', resolvedParams.documentId);
        setFormData({
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          fileDescription: data.fileDescription || '',
          notes: data.notes || '',
        });
      } catch (error) {
        console.error('Error fetching deliverable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverable();
  }, [resolvedParams.documentId]);

  const handleUploadSuccess = async (result: UploadResult) => {
    console.log('Upload successful:', result);
    // Update the storage bucket reference in the deliverable
    try {
      const uploadedFile = result.successful[0] as ExtendedUppyFile;
      await update('deliverables-documents', resolvedParams.documentId, {
        storage_bucket: {
          fileName: uploadedFile.name,
          key: uploadedFile.response?.body?.Key || '',
          bucket: uploadedFile.response?.body?.Bucket || '',
          uploadId: uploadedFile.uploadId || '',
          versionId: uploadedFile.response?.body?.VersionId || '',
          etag: ((uploadedFile.response?.body?.ETag as string) || '').replace(/"/g, ''),
          checksumCRC32: uploadedFile.response?.body?.ChecksumCRC32 || '',
          url: uploadedFile.uploadURL || '',
          size: uploadedFile.size,
          mimeType: uploadedFile.type,
          statusUpload: "completed"
        }
      });
    } catch (error) {
      console.error('Error updating deliverable:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update('deliverables-documents', resolvedParams.documentId, formData);
      window.location.href = '/service/deliverables';
    } catch (error) {
      console.error('Error updating deliverable:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loading description="Loading deliverable data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="edit-deliverable-page mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/service">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/deliverables">Deliverables</BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>Edit Deliverable</BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Edit Deliverable</h1>
          </div>
        </div>

        {/* Form Section */}
        <Form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <TextInput
              id="customerName"
              name="customerName"
              labelText="Customer Name"
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
            
            <TextInput
              id="customerEmail"
              name="customerEmail"
              labelText="Customer Email"
              type="email"
              placeholder="Enter customer email"
              value={formData.customerEmail}
              onChange={handleInputChange}
              required
            />

            <TextInput
              id="fileDescription"
              name="fileDescription"
              labelText="File Description"
              placeholder="Enter file description"
              value={formData.fileDescription}
              onChange={handleInputChange}
              required
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

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mr-2"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                kind="secondary"
                onClick={() => window.location.href = '/service/deliverables'}
              >
                Cancel
              </Button>
            </div>
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