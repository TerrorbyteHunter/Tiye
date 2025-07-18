import React from 'react';

type BadgeProps = {
  variant?: 'success' | 'warning' | 'error' | 'info';
  children: string;
  className?: string;
}

export const Badge = ({ 
  variant = 'info', 
  children, 
  className = '' 
}: BadgeProps) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}; 