'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { MultipartFileUploader, type ExtendedUploadResult } from '@/app/components/MultipartFileUploader';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  Form,
  TextInput,
  TextArea,
  Button,
  Loading,
  Select,
  SelectItem,
  ToastNotification
} from '@carbon/react';
import { create } from '@/lib/strapiClient';

interface DeliverableFormData {
  customerName: string;
  customerEmail: string;
  fileDescription: string;
  notes: string;
  request_customer: string | null;
}

interface ClientRequest {
  id: string;
  attributes: {
    title: string;
    description: string;
  }
}

export default function AddDeliverablePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<DeliverableFormData>({
    customerName: '',
    customerEmail: '',
    fileDescription: '',
    notes: '',
    request_customer: null,
  });

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch client requests
  //       const requestsResponse = await fetch('/api/client-requests');
  //       const requestsData = await requestsResponse.json();
  //       setClientRequests(requestsData.data || []);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        fileDescription: formData.fileDescription,
        notes: formData.notes,
        storage_bucket: documentId ? {
          connect: {documentId: documentId}
        } : null,
        publishedAt: new Date().toISOString()
      };
      console.log('Submitting data:', submitData);
      const response = await create('deliverables-documents', submitData);
      console.log('Response from Strapi:', response);
      setShowSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/service/deliverables';
      }, 2000);
    } catch (error) {
      console.error('Error creating deliverable:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loading description="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="edit-deliverable-page mx-auto max-w-7xl space-y-6">
        {showSuccess && (
          <ToastNotification
            kind="success"
            title="Success"
            subtitle="Deliverable has been created successfully"
            onClose={() => setShowSuccess(false)}
            lowContrast
            className="mb-4"
          />
        )}
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/service">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/deliverables">Deliverables</BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>Add Deliverable</BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Add Deliverable</h1>
          </div>
        </div>

        {/* Form Section */}
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              <Select
                id="request_customer"
                name="request_customer"
                labelText="Client Request"
                value={formData.request_customer || ''}
                onChange={handleInputChange}
              >
                <SelectItem value="" text="Select a client request" />
                {clientRequests.map((request) => (
                  <SelectItem
                    key={request.id}
                    value={request.id}
                    text={request.attributes.title}
                  />
                ))}
              </Select>

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

              <div className="flex justify-end mt-6">
                <Button
                  type="submit"
                  className="mr-2"
                  disabled={btnDisabled || saving}
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
            </div>

            {/* Right Column - Upload Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Upload Files</h3>
              <MultipartFileUploader 
                theme="dark"
                onUploadSuccess={(result) => {
                  console.log('upload/page.tsx received : ', result);
                  setDocumentId((result as ExtendedUploadResult).documentId || null);
                  setBtnDisabled(false);
                }}
              />
            </div>
          </div>
        </Form>
      </div>
    </DashboardLayout>
  );
} 