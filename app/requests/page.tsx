'use client';

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RequestList from '../components/RequestList';
import { 
  Breadcrumb, 
  BreadcrumbItem,
  Button,
  ContentSwitcher,
  Switch,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

// Example data - replace with actual API call
const mockRequests = [
  {
    "id": 64,
    "documentId": "dmytskridoi8lyqpa9xmpxtg",
    "fullName": "Dinh Viet Linh",
    "email": "linhtx2004@gmail.com",
    "phoneNumber": "879696967",
    "address": "Ko ",
    "processingRequestDetails": "Ko ",
    "createdAt": "2025-05-09T20:15:33.243Z",
    "updatedAt": "2025-05-09T20:15:33.243Z",
    "publishedAt": "2025-05-09T20:15:33.271Z",
    "document": "https://pub-222c56a43239471c83385141297e70d8.r2.dev/2/3/12bbfe_6ceca0ea22294e5082c17d0932563c90_mv2_9988d4a2b5.avif"
  }
];

export default function RequestsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <DashboardLayout>
      <div className="requests-page space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/requests" isCurrentPage>
                Requests
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold mt-2">Customer Requests</h1>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex justify-between items-center">
          <ContentSwitcher
            selectedIndex={selectedIndex}
            onChange={({ index }) => index !== undefined && setSelectedIndex(index)}
            size="md"
          >
            <Switch name="all" text="All Requests" />
            <Switch name="pending" text="Pending" />
            <Switch name="completed" text="Completed" />
          </ContentSwitcher>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-lg shadow">
          <RequestList requests={mockRequests} />
        </div>
      </div>
    </DashboardLayout>
  );
} 