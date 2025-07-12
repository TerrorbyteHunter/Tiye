import React from 'react';

type FormDescriptionProps = {
  children: string;
  className?: string;
}

export const FormDescription = ({ 
  children,
  className = '' 
}: FormDescriptionProps) => {
  return (
    <p className={`mt-1 text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
}; 