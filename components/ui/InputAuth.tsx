import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID for the input if one isn't provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("flex flex-col", fullWidth ? "w-full" : "")}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "block rounded-md border-gray-300 shadow-sm transition-colors",
              "focus:border-primary-500 focus:ring-primary-500 focus:outline-none",
              "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
              "dark:focus:border-primary-500 dark:focus:ring-primary-500",
              error
                ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                : "border-gray-300",
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              "py-2 text-sm w-full",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400 animate-slide-down">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        {!error && !helperText && (
          <p className="mt-1 text-sm text-transparent">&nbrs;</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
