import React from 'react';

type FormColumnProps = {
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  children: any;
  className?: string;
}

export const FormColumn = ({ 
  span = 6,
  children,
  className = '' 
}: FormColumnProps) => {
  return (
    <div className={`sm:col-span-${span} ${className}`}>
      {children}
    </div>
  );
}; 