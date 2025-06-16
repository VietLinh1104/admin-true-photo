'use client';

import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import {
  Grid,
  Column,
  // Tile,
  ClickableTile,
  // StructuredListWrapper,
  // StructuredListHead,
  // StructuredListRow,
  // StructuredListCell,
  // StructuredListBody,
} from '@carbon/react';
import {
  UserMultiple,
  Report,
  DocumentImport,
  EmailNew 
} from '@carbon/icons-react';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="dashboard-page p-20">
        <h1 className="cds--type-productive-heading-05 dashboard-title">Dashboard Overview</h1>
        
        {/* Quick Actions */}
        <h2 className="cds--type-productive-heading-03 section-title">Quick Actions</h2>
        <Grid className="actions-grid">
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/document/document-list" className="action-tile">
              <DocumentImport size={32} />
              <h3>Document List</h3>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/service/client-requests" className="action-tile">
              <UserMultiple size={32} />
              <h3>Client Requests</h3>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/service/email-submissions" className="action-tile">
              <EmailNew  size={32} />
              <h3>Email Submissions</h3>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/service/deliverables" className="action-tile">
              <Report size={32} />
              <h3>
Deliverables</h3>
            </ClickableTile>
          </Column>
        </Grid>

        

        {/* Recent Activity */}
        {/* <h2 className="cds--type-productive-heading-03 section-title">Recent Activity</h2>
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Activity</StructuredListCell>
              <StructuredListCell head>User</StructuredListCell>
              <StructuredListCell head>Time</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            <StructuredListRow>
              <StructuredListCell>New photo uploaded</StructuredListCell>
              <StructuredListCell>John Doe</StructuredListCell>
              <StructuredListCell>5 minutes ago</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell>User registration</StructuredListCell>
              <StructuredListCell>Jane Smith</StructuredListCell>
              <StructuredListCell>15 minutes ago</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
              <StructuredListCell>Photo reported</StructuredListCell>
              <StructuredListCell>Mike Johnson</StructuredListCell>
              <StructuredListCell>1 hour ago</StructuredListCell>
            </StructuredListRow>
          </StructuredListBody>
        </StructuredListWrapper> */}
      </div>
    </DashboardLayout>
  );
}
