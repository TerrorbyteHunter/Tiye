import React from 'react';

type FormHintProps = {
  children: string;
  className?: string;
}

export const FormHint = ({ 
  children,
  className = '' 
}: FormHintProps) => {
  return (
    <p className={`mt-1 text-xs text-gray-400 ${className}`}>
      {children}
    </p>
  );
}; 