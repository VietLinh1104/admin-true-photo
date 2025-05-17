'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import CustomerRequestList from '@/app/components/CustomerRequestList';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  DataTableSkeleton,
} from '@carbon/react';
import { getAll, update } from '@/lib/strapiClient';

export default function ClientRequestsPage() {
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const headers = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'requestStatus', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'document', header: 'Document' },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAll('request-customers');
      console.log(data);
      setRequests(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (requestId: number) => {
    try {
      // In a real application, you would get the current user's name from auth context
      const currentUser = 'Current User'; // This should be replaced with actual user name
      
      await update('request-customers', requestId, {
        assignedTo: currentUser,
        requestStatus: 'Processing', // Automatically change status when assigned
      });
      // Refresh the requests list after assignment
      await fetchRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);

  return (
    <DashboardLayout>
      <div className="client-requests-page mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/service">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/client-requests" isCurrentPage>
                Client Requests
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Client Requests</h1>
          </div>
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
            <CustomerRequestList
              requests={requests}
              loading={loading}
              page={page}
              totalItems={totalItems}
              onPageChange={setPage}
              onAssign={handleAssign}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
