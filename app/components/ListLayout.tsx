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
import { Add } from '@carbon/icons-react';



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
        <div className="mx-auto justify-between pl-10 pr-10 gap-4">
          {/* Breadcrumb */}
          <div className=" flex justify-between items-center">

            <div className="">
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

            <Button kind="primary" renderIcon={Add}>
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 grid ">

        {/* Tabs */}
        <div className="">
          {children}
        </div>

      </div>

    </DashboardLayout>
  );
};

export default ListLayout;
