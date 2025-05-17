'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import DeliverableList from '@/app/components/DeliverableList';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  DataTableSkeleton,
  Button
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { getAll } from '@/lib/strapiClient';

export default function DeliverablesPage() {
  const [page, setPage] = useState(1);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const headers = [
    { key: 'customerName', header: 'Customer Name' },
    { key: 'customerEmail', header: 'Email' },
    { key: 'fileDescription', header: 'Description' },
    { key: 'requestStatus', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
  ];

  const fetchDeliverables = async () => {
    setLoading(true);
    try {
      const data = await getAll('deliverables-documents');
      console.log(data);
      setDeliverables(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [page]);

  const handleAddClick = () => {
    window.location.href = '/service/deliverables/add';
  };

  return (
    <DashboardLayout>
      <div className="deliverables-page mx-auto max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/service">Service</BreadcrumbItem>
              <BreadcrumbItem href="/service/deliverables" isCurrentPage>
                Deliverables
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Deliverables</h1>
          </div>
          <Button
            renderIcon={Add}
            onClick={handleAddClick}
          >
            Add Deliverable
          </Button>
        </div>

        {/* List Section */}
        <div className="p-0 rounded-lg shadow">
          {loading ? (
            <DataTableSkeleton 
              className="bg-black !p-0"
              rowCount={5} 
              columnCount={headers.length} 
              headers={headers}
            />
          ) : (
            <DeliverableList
              deliverables={deliverables}
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
