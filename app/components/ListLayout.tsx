'use client';
import '@carbon/styles/css/styles.css';

import DashboardLayout from './DashboardLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  OverflowMenu,
  OverflowMenuItem,
  Tile

} from '@carbon/react';



interface BreadcrumbItemType {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface ListLayoutProps {
  children: React.ReactNode;
  breadcrumbData: BreadcrumbItemType[];
}



const ListLayout: React.FC<ListLayoutProps> = ({ children, breadcrumbData }) => {

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
              <Button kind="primary">
                Add
              </Button>
              {/* <OverflowMenu ariaLabel="More options" flipped>
                <OverflowMenuItem itemText="Delete" />
              </OverflowMenu> */}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 grid grid-cols-4 gap-4">

        {/* Tabs */}
        <div className="col-span-3">
          {children}
        </div>

      </div>

    </DashboardLayout>
  );
};

export default ListLayout;
