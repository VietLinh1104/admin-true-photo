'use client';

import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Stack,
  Form,
  PasswordInput,
  Checkbox,
} from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual login logic here
      console.log('Login attempt with:', { email, password, rememberMe });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard on success
      router.push('/requests');
    } catch (error) {
      console.error('Login failed:', error);
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

        <Form onSubmit={handleSubmit} className="login-form">
          <Stack gap={7}>
            <TextInput
              id="email"
              labelText="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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