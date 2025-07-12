import React from 'react';

type FormLegendProps = {
  children: string;
  className?: string;
}

export const FormLegend = ({ 
  children,
  className = '' 
}: FormLegendProps) => {
  return (
    <legend className={`text-base font-medium text-gray-900 ${className}`}>
      {children}
    </legend>
  );
}; 