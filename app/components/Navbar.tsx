'use client';

import React from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from '@carbon/react';
import { UserAvatar, Notification, Search } from '@carbon/icons-react';

const Navbar: React.FC = () => {
  return (
    <Header aria-label="True Photo Admin">
      <HeaderName href="/" prefix="Admin">
      True Photo
      </HeaderName>
      <HeaderNavigation aria-label="True Photo Admin">
        <HeaderMenuItem href="/">Dashboard</HeaderMenuItem>
        <HeaderMenuItem href="/requests">Request List</HeaderMenuItem>
        <HeaderMenuItem href="/settings">Settings</HeaderMenuItem>
      </HeaderNavigation>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Search" onClick={() => {}}>
          <Search size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="Notifications" onClick={() => {}}>
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="User Avatar" onClick={() => {}}>
          <UserAvatar size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
};

export default Navbar; 