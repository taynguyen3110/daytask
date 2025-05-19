'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import Input from '../ui/InputAuth';
import Button from '../ui/ButtonAuth';
import Alert from '../ui/AlertAuth';
import { useAuthStore } from '@/lib/stores/auth-store';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await register(data.username, data.email, data.password, data.confirmPassword);
      router.push('/login');
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.errors || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign up to start managing your tasks
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Username"
          fullWidth
          error={errors.username?.message}
          {...registerField('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
            maxLength: {
              value: 50,
              message: 'Username cannot exceed 50 characters',
            },
          })}
        />

        <Input
          label="Email"
          type="email"
          fullWidth
          error={errors.email?.message}
          {...registerField('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'A valid email address is required',
            },
            maxLength: {
              value: 100,
              message: 'Email cannot exceed 100 characters',
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          fullWidth
          error={errors.password?.message}
          {...registerField('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            maxLength: {
              value: 100,
              message: 'Password cannot exceed 100 characters',
            },
            validate: {
              hasUpper: (v) =>
                /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
              hasLower: (v) =>
                /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
              hasNumber: (v) =>
                /[0-9]/.test(v) || 'Password must contain at least one number',
              hasSpecial: (v) =>
                /[^a-zA-Z0-9]/.test(v) ||
                'Password must contain at least one special character',
            },
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          fullWidth
          error={errors.confirmPassword?.message}
          {...registerField('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          fullWidth
          icon={<UserPlus size={16} />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
