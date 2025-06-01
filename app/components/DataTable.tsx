import React from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
} from '@carbon/react';
import {TrashCan, Edit, OverflowMenuVertical } from '@carbon/react/icons';

interface Column {
  header: string;
  key: string;
}

interface TableRow {
  id: string;
  cells: Array<{
    id: string;
    value: string | number;
    info?: {
      header: string;
    };
  }>;
}

interface DataTableProps {
  loading: boolean;
  rows: TableRow[];
  headers: Column[];
  onEdit?: (row: TableRow) => void;
  onDelete?: (row: TableRow) => void;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (pageInfo: { page: number; pageSize: number }) => void;
  page?: number;
  sortKey?: string;
  sortDirection?: 'ASC' | 'DESC';
  onSort?: (key: string) => void;
  onRowClick?: (row: TableRow) => void;
}

export const CustomDataTable: React.FC<DataTableProps> = ({
  loading,
  rows,
  headers,
  onEdit,
  onDelete,
  pageSize = 10,
  totalItems,
  onPageChange,
  page = 1,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
}) => {
  const handlePageChange = (pageInfo: { page: number; pageSize: number }) => {
    onPageChange?.(pageInfo);
  };

  return (
    <div className="data-table-container">
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
        <DataTable rows={rows} headers={headers}>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps,
          }) => {
            const { ...restTableContainerProps } = getTableContainerProps();
            return (
              <div {...restTableContainerProps}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => {
                        const headerProps = getHeaderProps({ header });
                        const { key, ...restHeaderProps } = headerProps;
                        return (
                          <TableHeader
                            key={key}
                            {...restHeaderProps}
                            onClick={() => onSort && onSort(header.key)}
                            style={{ cursor: 'pointer' }}
                          >
                            {header.header}
                            {sortKey === header.key && (
                              sortDirection === 'ASC' ? ' ▲' : ' ▼'
                            )}
                          </TableHeader>
                        );
                      })}
                      {(onEdit || onDelete) && (
                        <TableHeader>Actions</TableHeader>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const rowProps = getRowProps({ row });
                      const { key: rowKey, ...restRowProps } = rowProps;
                      return (
                        <TableRow
                          key={rowKey}
                          {...restRowProps}
                          onClick={() => onRowClick && onRowClick(row)}
                          style={{ cursor: onRowClick ? 'pointer' : undefined }}
                        >
                          {row.cells.map((cell) => {
                            if (cell.info && cell.info.header === 'mimeType') {
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type="blue">{cell.value}</Tag>
                                </TableCell>
                              );
                            }
                            if (cell.info && cell.info.header === 'statusUpload') {
                              let tagType: 'gray' | 'green' | 'red' | 'blue' | 'warm-gray' | 'magenta' | 'purple' | 'cyan' | 'teal' | 'cool-gray' | 'high-contrast' | 'outline' = 'gray';
                              if (cell.value === 'success') tagType = 'green';
                              else if (cell.value === 'error') tagType = 'red';
                              else if (cell.value === 'pending') tagType = 'warm-gray';
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={tagType}>{cell.value}</Tag>
                                </TableCell>
                              );
                            }
                            return (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            );
                          })}
                          {(onEdit || onDelete) && (
                            <TableCell>
                              <OverflowMenu
                                flipped
                                renderIcon={OverflowMenuVertical}
                                ariaLabel="Actions"
                              >
                                {onEdit && (
                                  <OverflowMenuItem
                                    itemText="Edit"
                                    onClick={() => onEdit(row)}
                                  >
                                    <Edit size={16} />
                                  </OverflowMenuItem>
                                )}
                                {onDelete && (
                                  <OverflowMenuItem
                                    itemText="Delete"
                                    onClick={() => onDelete(row)}
                                    isDelete
                                  >
                                    <TrashCan size={16} />
                                  </OverflowMenuItem>
                                )}
                              </OverflowMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {totalItems && (
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizes={[10, 20, 30, 50]}
                    totalItems={totalItems}
                    onChange={handlePageChange}
                    size="md"
                  />
                )}
              </div>
            );
          }}
        </DataTable>
      )}
    </div>
  );
};

export default CustomDataTable; 