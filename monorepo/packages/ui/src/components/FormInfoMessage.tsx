import React from 'react';

type FormInfoMessageProps = {
  children: string;
  className?: string;
}

export const FormInfoMessage = ({ 
  children,
  className = '' 
}: FormInfoMessageProps) => {
  return (
    <p className={`mt-1 text-sm text-blue-600 ${className}`}>
      {children}
    </p>
  );
}; 