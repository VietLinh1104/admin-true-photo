'use client';
import '@carbon/styles/css/styles.css';

import DashboardLayout from './DashboardLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

interface BreadcrumbItemType {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface ListLayoutProps {
  children: React.ReactNode;
  breadcrumbData: BreadcrumbItemType[];
  heading?: string;                        // ✅ Tuỳ chỉnh tiêu đề
  buttonLabel?: string;                   // ✅ Label của nút Add
  onButtonClick?: () => void;            // ✅ Sự kiện click
  hideButton?: boolean;                  // ✅ Ẩn hiện nút
  buttonDisabled?: boolean;             // ✅ Disable nút
}

const ListLayout: React.FC<ListLayoutProps> = ({
  children,
  breadcrumbData,
  heading = 'Document',
  buttonLabel = 'Add',
  onButtonClick,
  hideButton = false,
  buttonDisabled = false,
}) => {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="w-full justify-between items-center py-10">
        <div className="mx-auto justify-between pl-10 pr-10 gap-4">
          {/* Breadcrumb & Heading */}
          <div className="flex justify-between items-center">
            <div>
              <Breadcrumb noTrailingSlash>
                {breadcrumbData.map((item, idx) => (
                  <BreadcrumbItem
                    key={idx}
                    href={item.href}
                    isCurrentPage={item.isCurrentPage}
                  >
                    {item.label}
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
              <h1 className="text-2xl font-semibold mt-2 text-white">{heading}</h1>
            </div>

            {/* Action Button */}
            {!hideButton && (
              <Button
                kind="primary"
                renderIcon={Add}
                disabled={buttonDisabled}
                onClick={onButtonClick}
              >
                {buttonLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 grid">
        <div>{children}</div>
      </div>
    </DashboardLayout>
  );
};

export default ListLayout;
