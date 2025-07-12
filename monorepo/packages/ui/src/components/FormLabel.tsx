import React from 'react';

type FormLabelProps = {
  children: string;
  required?: boolean;
  className?: string;
}

export const FormLabel = ({ 
  children,
  required = false,
  className = '' 
}: FormLabelProps) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}; 