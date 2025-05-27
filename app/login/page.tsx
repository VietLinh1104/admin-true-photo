'use client';

import React, { useState, Suspense } from 'react';
import {
  TextInput,
  Button,
  Stack,
  Form,
  PasswordInput,
  Checkbox,
} from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/strapiClient';

function LoginContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/requests';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login(identifier, password);
      
      if (response.jwt && response.user) {
        // Choose storage based on remember me preference
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Store the JWT token
        storage.setItem('token', response.jwt);
        // Store user data
        storage.setItem('user', JSON.stringify(response.user));
        
        // Set a cookie to indicate token presence (for middleware)
        document.cookie = 'hasToken=true; path=/';
        
        // Redirect to the original requested page or dashboard
        router.push(from);
      } else {
        setErrorMessage('Invalid login response');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cds-background)]">
      <div className="w-full max-w-md p-8 border border-gray-700 bg-[var(--cds-layer-01)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">True Photo Admin</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="login-form">
          <Stack gap={7}>
            <TextInput
              id="identifier"
              labelText="Identifier"
              type="text"
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
              required
            />

            <PasswordInput
              id="password"
              labelText="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />

            <Checkbox
              id="remember-me"
              labelText="Remember me"
              checked={rememberMe}
              onChange={(_, { checked }) => setRememberMe(checked)}
            />

            <Button
              type="submit"
              renderIcon={LoginIcon}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 