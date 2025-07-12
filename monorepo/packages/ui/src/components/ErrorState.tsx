import React from 'react';

type ErrorStateProps = {
  variant?: 'page' | 'section' | 'inline';
  title?: string;
  message?: string;
  action?: any;
  className?: string;
}

export const ErrorState = ({ 
  variant = 'section', 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  action,
  className = '' 
}: ErrorStateProps) => {
  const icon = (
    <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  if (variant === 'page') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          {icon}
          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          {action && (
            <div className="mt-6">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={`py-12 flex items-center justify-center ${className}`}>
        <div className="text-center">
          {icon}
          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          {action && (
            <div className="mt-6">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}; 