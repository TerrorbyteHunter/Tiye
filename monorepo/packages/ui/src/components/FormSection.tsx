import React from 'react';

type FormSectionProps = {
  title: string;
  description?: string;
  children: any;
  className?: string;
}

export const FormSection = ({ 
  title, 
  description, 
  children,
  className = '' 
}: FormSectionProps) => {
  return (
    <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3 ${className}`}>
      <div className="sm:col-span-1">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        {children}
      </div>
    </div>
  );
}; 