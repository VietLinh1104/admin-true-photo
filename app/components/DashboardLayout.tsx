'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Theme } from '@carbon/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Theme theme="g100">
      <div className="dashboard-container">
        <div className="z-10">

        <Navbar />
        </div>

        <div className="dashboard-content z-0">
          <Sidebar />
          <main className="main-content px-0 !bg-[#161616]">
            {children}
          </main>
        </div>

      </div>
    </Theme>
  );
};

export default DashboardLayout; 