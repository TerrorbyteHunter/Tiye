import React from 'react';

type FormDividerProps = {
  text?: string;
  className?: string;
}

export const FormDivider = ({ 
  text,
  className = '' 
}: FormDividerProps) => {
  if (text) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-gray-200 ${className}`} />
  );
}; 