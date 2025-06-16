'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastNotification } from '@carbon/react';


interface NotificationContextType {
  addNotification: (type: 'success' | 'error', message: string) => void;
  clearNotification: (type: 'success' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addNotification = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMessage(message);
    } else {
      setError(message);
    }
  };

  const clearNotification = (type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(null);
    } else {
      setError(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification, clearNotification }}>
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {successMessage && (
          <ToastNotification
            kind="success"
            title="Success"
            subtitle={successMessage}
            onClose={() => setSuccessMessage(null)}
            timeout={5000}
          />
        )}
        {error && (
          <ToastNotification
            kind="error"
            title="Error"
            subtitle={error}
            onClose={() => setError(null)}
            timeout={5000}
          />
        )}
      </div>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};