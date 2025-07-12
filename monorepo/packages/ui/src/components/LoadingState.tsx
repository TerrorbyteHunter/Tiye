import React from 'react';

type LoadingStateProps = {
  variant?: 'page' | 'section' | 'inline';
  text?: string;
  className?: string;
}

export const LoadingState = ({ 
  variant = 'section', 
  text = 'Loading...',
  className = '' 
}: LoadingStateProps) => {
  if (variant === 'page') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="spinner mx-auto" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">{text}</h3>
        </div>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={`py-12 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="spinner mx-auto" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">{text}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="spinner" />
      <span className="text-sm font-medium text-gray-900">{text}</span>
    </div>
  );
}; 