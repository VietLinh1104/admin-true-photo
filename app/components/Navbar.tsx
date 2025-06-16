'use client';

import React, { useState, useEffect } from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherItem,
} from '@carbon/react';
import { UserAvatar, Notification, Search, Logout } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

// Utility function to delete all cookies
const deleteAllCookies = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
};

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check both localStorage and sessionStorage for user data
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    deleteAllCookies();
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <Header aria-label="True Photo Admin">
      <HeaderName href="/" prefix="Admin">
        True Photo
      </HeaderName>
      <HeaderNavigation aria-label="True Photo Admin">
        <HeaderMenuItem href="/">Dashboard</HeaderMenuItem>
        <HeaderMenuItem href="/service/client-requests">Request List</HeaderMenuItem>
        <HeaderMenuItem href="/">Settings</HeaderMenuItem>
      </HeaderNavigation>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Search" onClick={() => {}}>
          <Search size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="Notifications" onClick={() => {}}>
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction 
          aria-label="User Avatar" 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          isActive={isUserMenuOpen}
        >
          <UserAvatar size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
      <HeaderPanel aria-label="User Menu" expanded={isUserMenuOpen}>
        <Switcher aria-label="User Menu">
          {user && (
            <div className="p-4 border-b border-gray-700">
              <p className="font-semibold">{user.firstname} {user.lastname}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          )}
          <SwitcherItem aria-label="Logout" onClick={handleLogout}>
            <div className="flex items-center gap-2">
              <Logout size={20} />
              <span>Logout</span>
            </div>
          </SwitcherItem>
        </Switcher>
      </HeaderPanel>
    </Header>
  );
};

export default Navbar; 