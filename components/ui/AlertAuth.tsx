import React from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variantClasses: Record<AlertVariant, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    },
  };

  const { bg, text, border, icon } = variantClasses[variant];

  return (
    <div 
      className={clsx(
        'rounded-md border p-4',
        bg,
        text,
        border,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={clsx('text-sm', title && 'mt-2')}>{children}</div>
        </div>
        {onClose && (
          <div className="pl-3 ml-auto">
            <button
              type="button"
              className={clsx(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                text,
                'hover:bg-white dark:hover:bg-gray-800'
              )}
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;