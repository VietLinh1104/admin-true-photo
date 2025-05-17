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
        <Navbar />

        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content pt-20">
            {children}
          </main>
        </div>

      </div>
    </Theme>
  );
};

export default DashboardLayout; 