'use client';

import React from 'react';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from '@carbon/react';
import {
  Dashboard,
  Document,
  Settings,
  Category,
} from '@carbon/icons-react';

const Sidebar: React.FC = () => {
  return (
    <SideNav
      isFixedNav
      expanded={true}
      isChildOfHeader={false}
      aria-label="Side navigation"
    >
      <SideNavItems>
        <SideNavLink renderIcon={Dashboard} href="/">
          Dashboard
        </SideNavLink>
        <SideNavMenu renderIcon={Document} title="Document Management">
          <SideNavMenuItem href="/document/document-list">List Document</SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu renderIcon={Category} title="Service Management">
          <SideNavMenuItem href="/service/client-requests">Client Requests</SideNavMenuItem>
          <SideNavMenuItem href="/service/email-submissions">Email Submissions</SideNavMenuItem>
          <SideNavMenuItem href="/service/deliverables">Deliverables</SideNavMenuItem>
        </SideNavMenu>
        <SideNavLink renderIcon={Settings} href="/settings">
          Settings
        </SideNavLink>
      </SideNavItems>
    </SideNav>
  );
};

export default Sidebar;