'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import EmailSubmissionList from '@/app/components/EmailSubmissionList';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  DataTableSkeleton,
} from '@carbon/react';
import { getAll, update } from '@/lib/strapiClient';

export default function EmailSubmissionsPage() {
  const [page, setPage] = useState(1);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const headers = [
    { key: 'email', header: 'Email' },
    { key: 'documentId', header: 'Document ID' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'assignedTo', header: 'Assigned To' },
  ];

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getAll('client-email-submissions');
      setSubmissions(data || []);
      setTotalItems(data?.length || 0);
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
      setSubmissions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (submissionId: number) => {
    try {
      // In a real application, you would get the current user's name from auth context
      const currentUser = 'Current User'; // This should be replaced with actual user name
      
      await update('client-email-submissions', submissionId, {
        assignedTo: currentUser,
      });
      // Refresh the submissions list after assignment
      await fetchSubmissions();
    } catch (error) {
      console.error('Error assigning submission:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  return (
    <DashboardLayout>
      <div className="email-submissions-page mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/service">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/email-submissions" isCurrentPage>
                Email Submissions
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Email Submissions</h1>
          </div>
        </div>

        {/* List Section */}
        <div className="p-0 rounded-lg shadow">
          {loading ? (
            <DataTableSkeleton 
              className="bg-black !p-0"
              rowCount={2} 
              columnCount={5} 
              headers={headers}
              showHeader={false}
              showToolbar={false}
            />
          ) : (
            <EmailSubmissionList
              submissions={submissions}
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
