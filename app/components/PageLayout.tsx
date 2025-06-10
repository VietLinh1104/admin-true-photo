'use client';

import '@carbon/styles/css/styles.css';
import React from 'react';
import DashboardLayout from './DashboardLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  OverflowMenu,
  OverflowMenuItem,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';

interface BreadcrumbItemType {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface MenuItem {
  itemText: string;
  onClick: () => void;
  isDelete?: boolean;
}

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbData: BreadcrumbItemType[];
  buttonLabel?: string;
  buttonIcon?: React.ComponentType;
  buttonOnClick?: () => void;
  buttonDisabled?: boolean; // ✅ NEW PROP
  menuItems?: MenuItem[];
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  breadcrumbData,
  buttonLabel = 'Assign to me',
  buttonIcon = Add,
  buttonOnClick,
  buttonDisabled = false, // ✅ Default to false
  menuItems = [{ itemText: 'Delete', onClick: () => {}, isDelete: true }],
}) => {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="w-full justify-between items-center py-10">
        <div className="mx-auto justify-between pl-16 pr-10 grid grid-cols-4 gap-4">
          {/* Breadcrumb */}
          <div className="col-span-3">
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
            <h1 className="text-2xl font-semibold mt-2 text-white">Document</h1>
          </div>

          {/* Buttons + OverflowMenu */}
          <div className="top-10 right-10 flex space-x-4 items-center my-auto col-span-1">
            <div className="flex justify-between items-center w-full">
              <Button
                kind="primary"
                renderIcon={buttonIcon}
                onClick={buttonOnClick}
                disabled={buttonDisabled} // ✅ Disable when prop is true
              >
                {buttonLabel}
              </Button>
              <OverflowMenu ariaLabel="More options" flipped>
                {menuItems.map((item, idx) => (
                  <OverflowMenuItem
                    key={idx}
                    itemText={item.itemText}
                    onClick={item.onClick}
                    isDelete={item.isDelete}
                  />
                ))}
              </OverflowMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 grid grid-cols-4 gap-4">
        {/* Tabs */}
        <div className="col-span-3">{children}</div>

        {/* Assignment */}
        <div className="col-span-1">
          <Tile>
            <h1 className="text-base font-bold mb-4">Assignment</h1>
            <p>Not available.</p>
          </Tile>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PageLayout;
