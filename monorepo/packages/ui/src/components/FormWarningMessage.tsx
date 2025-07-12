import React from 'react';

type FormWarningMessageProps = {
  children: string;
  className?: string;
}

export const FormWarningMessage = ({ 
  children,
  className = '' 
}: FormWarningMessageProps) => {
  return (
    <p className={`mt-1 text-sm text-yellow-600 ${className}`}>
      {children}
    </p>
  );
}; 