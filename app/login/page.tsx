"use client";

import React from "react";
import LoginForm from "../../components/auth/LoginForm";
import Alert from "../../components/ui/AlertAuth";
import { useAuthStore } from "@/lib/stores/auth-store";

const LoginPage: React.FC = () => {
  const { message } = useAuthStore();

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {message && (
          <Alert variant="success" className="mb-6">
            {message}
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
