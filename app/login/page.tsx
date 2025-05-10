"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import LoginForm from "../../components/auth/LoginForm";
import Alert from "../../components/ui/AlertAuth";

const LoginPage: React.FC = () => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Get registration success message from URL
  useEffect(() => {
    const message = searchParams.get("success");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-132px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
