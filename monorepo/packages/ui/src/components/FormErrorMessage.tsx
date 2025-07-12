import React from 'react';

type FormErrorMessageProps = {
  children: string;
  className?: string;
}

export const FormErrorMessage = ({ 
  children,
  className = '' 
}: FormErrorMessageProps) => {
  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
}; 