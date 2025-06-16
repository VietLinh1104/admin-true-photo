'use client';

import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Stack,
  Form,
  PasswordInput,
} from '@carbon/react';
import { UserFollow as RegisterIcon } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/apiClient';
import { AxiosError } from 'axios';

function RegisterContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (token && user) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== rePassword) {
      setErrorMessage('Mật khẩu không trùng khớp');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(username, password);

      if (response.data?.token && response.data?.user) {
        setSuccessMessage('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setErrorMessage('Phản hồi đăng ký không hợp lệ');
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data?.error || 'Đăng ký thất bại');
      } else {
        setErrorMessage('Đăng ký thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cds-background)]">
      <div className="w-full max-w-md p-8 border border-gray-700 bg-[var(--cds-layer-01)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Register Account</h1>
          <p className="text-gray-400">Create a new admin account</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Stack gap={7}>
            <TextInput
              id="username"
              labelText="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <PasswordInput
              id="password"
              labelText="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              id="re-password"
              labelText="Re-enter Password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
            />
            <Button
  type="submit"
  renderIcon={RegisterIcon}
  disabled={isLoading}
  size="lg"
  className="w-full"
>
  {isLoading ? 'Registering...' : 'Register'}
</Button>
          </Stack>
        </Form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-400">
            <a href="/login" className="text-blue-500 hover:underline">
              Login now
            </a>
          </span>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </React.Suspense>
  );
}
