'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  const from = searchParams.get('from') || '/';

  // 👇 Redirect nếu token đã tồn tại
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login(identifier, password);

      if (response.token && response.user) {
        const { id_user, username, role } = response.user;
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('token', response.token);
        storage.setItem('user', JSON.stringify({ id_user, username, role }));
        document.cookie = 'hasToken=true; path=/';
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
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <PasswordInput
              id="password"
              labelText="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <span className="text-sm text-gray-400">
            Don&#39;t have an account?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Register now
            </a>
          </span>

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
