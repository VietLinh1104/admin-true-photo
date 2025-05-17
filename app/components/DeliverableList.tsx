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
} from '@carbon/react';
import {
  Download,
  Document,
  Image as ImageIcon,
  Pdf,
  Edit,
} from '@carbon/icons-react';

interface RequestCustomer {
  id: number;
  documentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  processingRequestDetails: string;
  note: string;
  requestStatus: string;
}

interface StorageBucket {
  id: number;
  documentId: string;
  fileName: string;
  key: string;
  bucket: string;
  url: string;
  size: number;
  mimeType: string;
  statusUpload: string;
}

interface Deliverable {
  id: number;
  documentId: string;
  fileDescription: string;
  customerName: string;
  customerEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  request_customer: RequestCustomer;
  storage_bucket: StorageBucket;
}

interface DeliverableListProps {
  deliverables: Deliverable[];
  loading?: boolean;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const DeliverableList: React.FC<DeliverableListProps> = ({
  deliverables,
  loading = false,
  page,
  totalItems,
  onPageChange,
}) => {
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = [
    { key: 'customerName', header: 'Customer Name' },
    { key: 'customerEmail', header: 'Email' },
    { key: 'fileDescription', header: 'Description' },
    { key: 'requestStatus', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
  ];

  const rows = deliverables.map(deliverable => ({
    id: deliverable.id.toString(),
    customerName: deliverable.customerName,
    customerEmail: deliverable.customerEmail,
    fileDescription: deliverable.fileDescription,
    requestStatus: deliverable.request_customer?.requestStatus || 'N/A',
    createdAt: formatDate(deliverable.createdAt),
  }));

  const handleRowClick = (rowId: string) => {
    const deliverable = deliverables.find(d => d.id.toString() === rowId);
    if (deliverable) {
      setSelectedDeliverable(deliverable);
      setIsModalOpen(true);
    }
  };

  const handleEditClick = (documentId: string) => {
    window.location.href = `/service/deliverables/edit/${documentId}`;
  };

  if (!deliverables?.length) {
    return (
      <div className="p-6 text-center">
        <p>No deliverables found</p>
      </div>
    );
  }

  return (
    <div className="deliverable-list">
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
                            : cell.value === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
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
                      renderIcon={Download}
                      iconDescription="Download"
                      hasIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        const deliverable = deliverables.find(d => d.id.toString() === row.id);
                        if (deliverable?.storage_bucket?.url) {
                          window.open(deliverable.storage_bucket.url, '_blank');
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

      {selectedDeliverable && (
        <Modal
          open={isModalOpen}
          modalHeading="Deliverable Details"
          primaryButtonText="Close"
          secondaryButtonText="Edit"
          onRequestClose={() => setIsModalOpen(false)}
          onRequestSubmit={() => setIsModalOpen(false)}
          onSecondarySubmit={() => handleEditClick(selectedDeliverable.documentId)}
          hasScrollingContent
        >
          <div className="deliverable-details space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Customer Name:</p>
                <p>{selectedDeliverable.customerName}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedDeliverable.customerEmail}</p>
              </div>
              <div>
                <p className="font-semibold">Description:</p>
                <p>{selectedDeliverable.fileDescription}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p>{selectedDeliverable.request_customer?.requestStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Created At:</p>
                <p>{formatDate(selectedDeliverable.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold">Notes:</p>
                <p>{selectedDeliverable.notes || 'No notes'}</p>
              </div>
            </div>

            {selectedDeliverable.storage_bucket && (
              <div className="border border-gray-700 p-4 bg-[var(--cds-layer-01)]">
                <p className="font-semibold mb-3">File Details:</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedDeliverable.storage_bucket.mimeType.includes('pdf') ? (
                      <Pdf size={32} />
                    ) : selectedDeliverable.storage_bucket.mimeType.includes('image') ? (
                      <ImageIcon size={32} />
                    ) : (
                      <Document size={32} />
                    )}
                    <div>
                      <p className="font-medium">{selectedDeliverable.storage_bucket.fileName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{formatFileSize(selectedDeliverable.storage_bucket.size)}</span>
                        <Tag type="blue">{selectedDeliverable.storage_bucket.mimeType}</Tag>
                      </div>
                    </div>
                  </div>
                  <Button
                    kind="ghost"
                    renderIcon={Download}
                    iconDescription="Download"
                    hasIconOnly
                    onClick={() => window.open(selectedDeliverable.storage_bucket.url, '_blank')}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeliverableList; 