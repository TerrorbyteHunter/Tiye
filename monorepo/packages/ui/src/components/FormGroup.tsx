import React from 'react';

type FormGroupProps = {
  label?: string;
  error?: string;
  required?: boolean;
  children: any;
  className?: string;
}

export const FormGroup = ({ 
  label, 
  error, 
  required = false,
  children,
  className = '' 
}: FormGroupProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 