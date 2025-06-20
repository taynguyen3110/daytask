"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { LogIn, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/ButtonAuth";
import { Button as ThemeBtn } from "@/components/ui/button";
import Alert from "@/components/ui/AlertAuth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTheme } from "next-themes";
import MotionDiv from "../ui/MotionDiv";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { login, setMergeData } = useAuthStore();
  const { initializeTelegramUser } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      setMergeData(true);
      initializeTelegramUser();
      router.push("/");
      setSuccessMessage("Login successful!");
    } catch (err: any) {
      console.log("Login error:", err);
      
      setError(err.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      {/* <button className="flex items-center space-x-2 text-gray-800 hover:underline dark:text-white dark:hover:text-blue-300 transition-colors text-sm"
      onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button> */}
      <div className="text-center mb-8 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Log in to your account
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your credentials to access your tasks
        </p>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          className="mb-6"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            {...register("email", {
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
              <p className="absolute mt-1 text-xs text-red-600 dark:text-red-400">
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
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              maxLength: {
                value: 100,
                message: "Password cannot exceed 100 characters",
              },
            })}
          />
          {errors.password && (
            <MotionDiv>
              <p className="absolute mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            </MotionDiv>
          )}
        </div>

        {/* <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div> */}

        <Button
          type="submit"
          variant="default"
          isLoading={isLoading}
          fullWidth
          icon={<LogIn size={16} />}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Sign up
          </a>
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

export default LoginForm;
