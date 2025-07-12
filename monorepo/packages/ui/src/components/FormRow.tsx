import React from 'react';

type FormRowProps = {
  children: any;
  className?: string;
}

export const FormRow = ({ 
  children,
  className = '' 
}: FormRowProps) => {
  return (
    <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${className}`}>
      {children}
    </div>
  );
};
 