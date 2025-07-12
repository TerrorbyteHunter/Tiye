import React from 'react';

type FormSuccessMessageProps = {
  children: string;
  className?: string;
}

export const FormSuccessMessage = ({ 
  children,
  className = '' 
}: FormSuccessMessageProps) => {
  return (
    <p className={`mt-1 text-sm text-green-600 ${className}`}>
      {children}
    </p>
  );
}; 