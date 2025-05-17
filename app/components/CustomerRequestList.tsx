'use client';

import React, { useState } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  Button,
  Tag,
  Pagination,
  Dropdown,
} from '@carbon/react';
import { Document, UserAvatar } from '@carbon/icons-react';

interface DocumentData {
  id: number;
  documentId: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  statusUpload: string;
}

interface CustomerRequest {
  id: number;
  documentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  processingRequestDetails: string;
  note: string;
  requestStatus: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  document: DocumentData;
  assignedTo?: string;
}

interface AssigneeOption {
  id: string;
  text: string;
}

interface CustomerRequestListProps {
  requests: CustomerRequest[];
  loading?: boolean;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onAssign?: (requestId: number) => Promise<void>;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const CustomerRequestList: React.FC<CustomerRequestListProps> = ({
  requests,
  loading = false,
  page,
  totalItems,
  onPageChange,
  onAssign,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'requestStatus', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'document', header: 'Document' },
  ];

  const rows = requests.map(request => ({
    id: request.id.toString(),
    fullName: request.fullName,
    email: request.email,
    phoneNumber: request.phoneNumber,
    requestStatus: request.requestStatus,
    createdAt: formatDate(request.createdAt),
    document: request.document.fileName,
  }));

  const handleRowClick = (rowId: string) => {
    const request = requests.find(r => r.id.toString() === rowId);
    if (request) {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  if (!requests?.length) {
    return (
      <div className="p-6 text-center">
        <p>No requests found</p>
      </div>
    );
  }

  return (
    <div className="customer-request-list">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} size="lg" useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map(header => {
                  const { key, ...headerProps } = getHeaderProps({ header });
                  return (
                    <TableHeader key={header.key} {...headerProps}>
                      {header.header}
                    </TableHeader>
                  );
                })}
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow
                  key={row.id}
                  onClick={() => handleRowClick(row.id)}
                  className="cursor-pointer hover:bg-gray-800/10 transition-colors"
                >
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.id.includes('requestStatus') ? (
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          cell.value === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : cell.value === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cell.value}
                        </span>
                      ) : (
                        cell.value
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      kind="ghost"
                      renderIcon={Document}
                      iconDescription="View Details"
                      hasIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        const request = requests.find(r => r.id.toString() === row.id);
                        if (request) {
                          setSelectedRequest(request);
                          setIsModalOpen(true);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>

      <div className="bg-non">
        <Pagination
          page={page}
          pageSize={25}
          pageSizes={[25]}
          totalItems={totalItems}
          onChange={({ page }) => onPageChange(page)}
        />
      </div>

      {selectedRequest && (
        <Modal
          open={isModalOpen}
          modalHeading="Request Details"
          primaryButtonText="Close"
          secondaryButtonText="Assign to Me"
          onRequestClose={() => setIsModalOpen(false)}
          onRequestSubmit={() => setIsModalOpen(false)}
          onSecondarySubmit={async () => {
            if (onAssign) {
              try {
                await onAssign(selectedRequest.id);
              } catch (error) {
                console.error('Error assigning request:', error);
              }
            }
          }}
          size="lg"
        >
          <div className="request-details space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Full Name:</p>
                <p>{selectedRequest.fullName}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedRequest.email}</p>
              </div>
              <div>
                <p className="font-semibold">Phone Number:</p>
                <p>{selectedRequest.phoneNumber}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  selectedRequest.requestStatus === 'Completed' 
                    ? 'bg-green-100 text-green-800'
                    : selectedRequest.requestStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRequest.requestStatus}
                </span>
              </div>
            </div>

            <div>
              <p className="font-semibold">Address:</p>
              <p>{selectedRequest.address}</p>
            </div>

            <div>
              <p className="font-semibold">Processing Request Details:</p>
              <p>{selectedRequest.processingRequestDetails}</p>
            </div>

            <div>
              <p className="font-semibold">Note:</p>
              <div dangerouslySetInnerHTML={{ __html: selectedRequest.note }} />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>Currently assigned to:</p>
                  <p className="font-medium">
                    {selectedRequest.assignedTo || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-700 p-4 bg-[var(--cds-layer-01)]">
              <p className="font-semibold mb-3">Attached Document:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Document size={32} />
                  <div>
                    <p className="font-medium">{selectedRequest.document.fileName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Tag type="blue">{selectedRequest.document.mimeType}</Tag>
                    </div>
                  </div>
                </div>
                <Button
                  kind="ghost"
                  renderIcon={Document}
                  iconDescription="View Document"
                  onClick={() => window.open(selectedRequest.document.url, '_blank')}
                >
                  View Document
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-500">
              <div>
                <p>Created: {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <div>
                <p>Last Updated: {formatDate(selectedRequest.updatedAt)}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerRequestList; 