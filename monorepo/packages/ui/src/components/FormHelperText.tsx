import React from 'react';

type FormHelperTextProps = {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: string;
  className?: string;
}

export const FormHelperText = ({ 
  variant = 'info',
  children,
  className = '' 
}: FormHelperTextProps) => {
  const variants = {
    info: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  return (
    <p className={`mt-1 text-sm ${variants[variant]} ${className}`}>
      {children}
    </p>
  );
}; 