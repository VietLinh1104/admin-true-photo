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
  Pagination,
} from '@carbon/react';
import { Document } from '@carbon/icons-react';

interface EmailSubmission {
  id: number;
  documentId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  assignedTo?: string;
}

interface EmailSubmissionListProps {
  submissions: EmailSubmission[];
  loading?: boolean;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onAssign?: (submissionId: number) => Promise<void>;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const EmailSubmissionList: React.FC<EmailSubmissionListProps> = ({
  submissions,
  page,
  totalItems,
  onPageChange,
  onAssign,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<EmailSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = [
    { key: 'email', header: 'Email' },
    { key: 'documentId', header: 'Document ID' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'assignedTo', header: 'Assigned To' },
  ];

  const rows = submissions.map(submission => ({
    id: submission.id.toString(),
    email: submission.email,
    documentId: submission.documentId,
    createdAt: formatDate(submission.createdAt),
    assignedTo: submission.assignedTo || 'Not assigned',
  }));

  const handleRowClick = (rowId: string) => {
    const submission = submissions.find(s => s.id.toString() === rowId);
    if (submission) {
      setSelectedSubmission(submission);
      setIsModalOpen(true);
    }
  };

  if (!submissions?.length) {
    return (
      <div className="p-6 text-center">
        <p>No submissions found</p>
      </div>
    );
  }

  return (
    <div className="email-submission-list">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} size="lg" useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader {...getHeaderProps({ header })} key={`header-${index}`}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableHeader key="actions">Actions</TableHeader>
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
                      {cell.value}
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
                        const submission = submissions.find(s => s.id.toString() === row.id);
                        if (submission) {
                          setSelectedSubmission(submission);
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

      {selectedSubmission && (
        <Modal
          open={isModalOpen}
          modalHeading="Email Submission Details"
          primaryButtonText="Close"
          secondaryButtonText="Assign to Me"
          onRequestClose={() => setIsModalOpen(false)}
          onRequestSubmit={() => setIsModalOpen(false)}
          onSecondarySubmit={async () => {
            if (onAssign) {
              try {
                await onAssign(selectedSubmission.id);
              } catch (error) {
                console.error('Error assigning submission:', error);
              }
            }
          }}
          size="lg"
        >
          <div className="submission-details space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedSubmission.email}</p>
              </div>
              <div>
                <p className="font-semibold">Document ID:</p>
                <p>{selectedSubmission.documentId}</p>
              </div>
              <div>
                <p className="font-semibold">Created At:</p>
                <p>{formatDate(selectedSubmission.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold">Last Updated:</p>
                <p>{formatDate(selectedSubmission.updatedAt)}</p>
              </div>
            </div>

            {/* Assignment Status Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>Currently assigned to:</p>
                  <p className="font-medium">
                    {selectedSubmission.assignedTo || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmailSubmissionList; 