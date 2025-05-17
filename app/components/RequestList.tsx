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
} from '@carbon/react';
import {
  Download,
  Document,
  Image as ImageIcon,
  Pdf,
} from '@carbon/icons-react';
import { formatDate } from '../utils/dateUtils';

interface Request {
  id: number;
  documentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  processingRequestDetails: string;
  createdAt: string;
  document: string;
}

interface RequestListProps {
  requests: Request[];
}

const getFileIcon = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <Pdf size={32} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'avif':
      return <ImageIcon size={32} />;
    default:
      return <Document size={32} />;
  }
};

const getFileSize = () => {
  // Simulated file size for demonstration
  const sizes = ['2.5 MB', '1.8 MB', '3.2 MB', '4.1 MB'];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

const RequestList: React.FC<RequestListProps> = ({ requests }) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const headers = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'createdAt', header: 'Created At' },
  ];

  const rows = requests.map(request => ({
    id: request.id.toString(),
    fullName: request.fullName,
    email: request.email,
    phoneNumber: request.phoneNumber,
    createdAt: formatDate(request.createdAt),
  }));

  const handleRowClick = (rowId: string) => {
    const request = requests.find(r => r.id.toString() === rowId);
    if (request) {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  const handleAssignToMe = async () => {
    setIsAssigning(true);
    try {
      // TODO: Implement actual assign API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Assigned request to current user:', selectedRequest?.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to assign request:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="request-list">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} size="lg" useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
              // eslint-disable-next-line react/jsx-key
                  <TableHeader {...getHeaderProps({ header, id: header.key })}>
                    {header.header}
                  </TableHeader>
                ))}
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
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>

      {selectedRequest && (
        <Modal
          open={isModalOpen}
          modalHeading="Request Details"
          primaryButtonText="Close"
          secondaryButtons={[
            {
              buttonText: isAssigning ? "Assigning..." : "Assign to me",
              onClick: handleAssignToMe
            }
          ]}
          onRequestClose={() => setIsModalOpen(false)}
          onRequestSubmit={() => setIsModalOpen(false)}
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
                <p className="font-semibold">Created At:</p>
                <p>{formatDate(selectedRequest.createdAt)}</p>
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

            <div className="border border-gray-700 p-4 bg-[var(--cds-layer-01)]">
              <p className="font-semibold mb-3">Attached Document:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedRequest.document)}
                  <div>
                    <p className="font-medium">{selectedRequest.documentId}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{getFileSize()}</span>
                      <Tag type="blue">Document</Tag>
                    </div>
                  </div>
                </div>
                <Button
                  kind="ghost"
                  renderIcon={Download}
                  iconDescription="Download"
                  hasIconOnly
                  onClick={() => window.open(selectedRequest.document, '_blank')}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RequestList; 