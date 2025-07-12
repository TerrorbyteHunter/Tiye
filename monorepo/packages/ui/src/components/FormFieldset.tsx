import React from 'react';

type FormFieldsetProps = {
  legend?: string;
  children: any;
  className?: string;
}

export const FormFieldset = ({ 
  legend,
  children,
  className = '' 
}: FormFieldsetProps) => {
  return (
    <fieldset className={`space-y-4 ${className}`}>
      {legend && (
        <legend className="text-base font-medium text-gray-900">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}; 