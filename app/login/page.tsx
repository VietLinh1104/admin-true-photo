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
import { login } from '@/lib/strapiClient'; // ⬅ Đảm bảo login() trả về { token, user }

function LoginContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/';

  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes('hasToken=true')) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await login(identifier, password);

      if (res.token && res.user) {
        const { id_user, username, role } = res.user;
        const storage = rememberMe ? localStorage : sessionStorage;

        // Lưu user info UI
        storage.setItem('user', JSON.stringify({ id_user, username, role }));

        // Lưu token vào cookie (giả lập HttpOnly tạm thời)
        const maxAge = rememberMe ? 60 * 60 * 24 * 30 : null;
        document.cookie = `token=${res.token}; path=/; ${maxAge ? `max-age=${maxAge}` : ''}`;
        document.cookie = `hasToken=true; path=/; ${maxAge ? `max-age=${maxAge}` : ''}`;

        router.push(from);
      } else {
        setErrorMessage('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Login failed. Please try again.');
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
