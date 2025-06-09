import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';

interface BreadcrumbItemType {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface PageNavbarProps {
  breadcrumbData: BreadcrumbItemType[];
}

const PageNavbar: React.FC<PageNavbarProps> = ({ breadcrumbData }) => {
  return (
    <div className="flex w-full p-20 justify-between items-center bg-[#161616] relative border-b border-gray-700">
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
        <h1 className="text-2xl font-semibold mt-2">Document</h1>
      </div>
    </div>
  );
};

export default PageNavbar;
