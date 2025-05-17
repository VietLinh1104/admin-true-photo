'use client';

import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import {
  Grid,
  Column,
  Tile,
  ClickableTile,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import {
  UserMultiple,
  Image,
  Report,
  Growth,
  DocumentImport,
  Time,
} from '@carbon/icons-react';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <h1 className="cds--type-productive-heading-05 dashboard-title">Dashboard Overview</h1>
        
        {/* Statistics Grid */}
        <Grid className="stats-grid">
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <UserMultiple size={24} className="stats-icon" />
              <div className="stats-content">
                <p className="stats-number">1,234</p>
                <p className="stats-label">Total Users</p>
              </div>
            </Tile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <Image size={24} className="stats-icon" />
              <div className="stats-content">
                <p className="stats-number">5,678</p>
                <p className="stats-label">Total Photos</p>
              </div>
            </Tile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <Tile className="stats-tile">
              <Report size={24} className="stats-icon" />
              <div className="stats-content">
                <p className="stats-number">42</p>
                <p className="stats-label">Pending Reports</p>
              </div>
            </Tile>
          </Column>
        </Grid>

        

        {/* Quick Actions */}
        <h2 className="cds--type-productive-heading-03 section-title">Quick Actions</h2>
        <Grid className="actions-grid">
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/photos/pending" className="action-tile">
              <DocumentImport size={32} />
              <h3>Review Pending Photos</h3>
              <p>15 photos waiting for review</p>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/users/new" className="action-tile">
              <UserMultiple size={32} />
              <h3>Manage Users</h3>
              <p>View and manage user accounts</p>
            </ClickableTile>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <ClickableTile href="/reports" className="action-tile">
              <Report size={32} />
              <h3>Handle Reports</h3>
              <p>Review reported content</p>
            </ClickableTile>
          </Column>
        </Grid>

        

        {/* Recent Activity */}
        <h2 className="cds--type-productive-heading-03 section-title">Recent Activity</h2>
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
        </StructuredListWrapper>
      </div>
    </DashboardLayout>
  );
}
