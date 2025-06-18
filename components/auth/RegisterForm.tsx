"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Moon, Sun, UserPlus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Button from "../ui/ButtonAuth";
import { Button as ThemeBtn } from "@/components/ui/button";
import Alert from "../ui/AlertAuth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import MotionDiv from "../ui/MotionDiv";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await register(
        data.username,
        data.email,
        data.password,
        data.confirmPassword
      );
      router.push("/login");
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.errors ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create an account
        </h1>
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
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <Input
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            {...registerField("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
              maxLength: {
                value: 50,
                message: "Username cannot exceed 50 characters",
              },
            })}
          />
          {errors.username && (
            <MotionDiv>
              <p className="mt-1 text-xs absolute text-red-600 dark:text-red-400">
                {errors.username.message}
              </p>
            </MotionDiv>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            {...registerField("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "A valid email address is required",
              },
              maxLength: {
                value: 100,
                message: "Email cannot exceed 100 characters",
              },
            })}
          />
          {errors.email && (
            <MotionDiv>
              <p className="mt-1 text-xs absolute text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            </MotionDiv>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            {...registerField("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              maxLength: {
                value: 100,
                message: "Password cannot exceed 100 characters",
              },
              validate: {
                hasUpper: (v) =>
                  /[A-Z]/.test(v) ||
                  "Password must contain at least one uppercase letter",
                hasLower: (v) =>
                  /[a-z]/.test(v) ||
                  "Password must contain at least one lowercase letter",
                hasNumber: (v) =>
                  /[0-9]/.test(v) ||
                  "Password must contain at least one number",
                hasSpecial: (v) =>
                  /[^a-zA-Z0-9]/.test(v) ||
                  "Password must contain at least one special character",
              },
            })}
          />
          {errors.password && (
            <MotionDiv>
              <p className="mt-1 text-xs absolute text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            </MotionDiv>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            {...registerField("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <MotionDiv>
              <p className="mt-1 text-xs absolute text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            </MotionDiv>
          )}
        </div>

        <Button
          type="submit"
          variant="default"
          isLoading={isLoading}
          fullWidth
          icon={<UserPlus size={16} />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      {mounted && (
        <div className="w-40 mx-auto mt-5 text-gray-600 dark:text-gray-400">
          <ThemeBtn
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </ThemeBtn>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
