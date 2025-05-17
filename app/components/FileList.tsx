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
} from '@carbon/icons-react';

interface FileData {
  id: number;
  documentId: string;
  fileName: string;
  key: string;
  url: string;
  size: number;
  mimeType: string;
  statusUpload: string;
  createdAt: string;
}

interface FileListProps {
  files: FileData[];
  loading?: boolean;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return <Pdf size={32} />;
  } else if (mimeType.includes('image')) {
    return <ImageIcon size={32} />;
  } else {
    return <Document size={32} />;
  }
};

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

const FileList: React.FC<FileListProps> = ({ 
  files, 
  page,
  totalItems,
  onPageChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = [
    { key: 'fileName', header: 'File Name' },
    { key: 'documentId', header: 'Document ID' },
    { key: 'size', header: 'Size' },
    { key: 'mimeType', header: 'Type' },
    { key: 'statusUpload', header: 'Status' },
    { key: 'createdAt', header: 'Created At' },
  ];

  const rows = files.map(file => ({
    id: file.id.toString(),
    fileName: file.fileName,
    documentId: file.documentId,
    size: formatFileSize(file.size),
    mimeType: file.mimeType,
    statusUpload: file.statusUpload,
    createdAt: formatDate(file.createdAt),
  }));

  const handleRowClick = (rowId: string) => {
    const file = files.find(f => f.id.toString() === rowId);
    if (file) {
      setSelectedFile(file);
      setIsModalOpen(true);
    }
  };

  if (!files?.length) {
    return (
      <div className="p-6 text-center">
        <p>No files found</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <Table {...getTableProps()} size="lg" useZebraStyles>
            <TableHead>
              <TableRow>
              {headers.map(header => {
                const headerProps = getHeaderProps({ header, id: header.key });
                return (
                  // eslint-disable-next-line react/jsx-key
                  <TableHeader {...headerProps}>
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
                    <TableCell key={`${row.id}-${cell.id}`}>
                      {cell.id.includes('statusUpload') ? (
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          cell.value === 'completed' 
                            ? 'bg-green-100 text-green-800' 
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
                        const file = files.find(f => f.id.toString() === row.id);
                        if (file) window.open(file.url, '_blank');
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

      {selectedFile && (
        <Modal
          open={isModalOpen}
          modalHeading="File Details"
          primaryButtonText="Close"
          onRequestClose={() => setIsModalOpen(false)}
          onRequestSubmit={() => setIsModalOpen(false)}
        >
          <div className="file-details space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">File Name:</p>
                <p>{selectedFile.fileName}</p>
              </div>
              <div>
                <p className="font-semibold">Document ID:</p>
                <p>{selectedFile.documentId}</p>
              </div>
              <div>
                <p className="font-semibold">Size:</p>
                <p>{formatFileSize(selectedFile.size)}</p>
              </div>
              <div>
                <p className="font-semibold">Created At:</p>
                <p>{formatDate(selectedFile.createdAt)}</p>
              </div>
            </div>

            <div className="border border-gray-700 p-4 bg-[var(--cds-layer-01)]">
              <p className="font-semibold mb-3">File Preview:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.mimeType)}
                  <div>
                    <p className="font-medium">{selectedFile.fileName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <Tag type="blue">{selectedFile.mimeType}</Tag>
                    </div>
                  </div>
                </div>
                <Button
                  kind="ghost"
                  renderIcon={Download}
                  iconDescription="Download"
                  hasIconOnly
                  onClick={() => window.open(selectedFile.url, '_blank')}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FileList; 