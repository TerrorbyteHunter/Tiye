import React from 'react';

type FormCheckboxProps = {
  label: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const FormCheckbox = ({ 
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '' 
}: FormCheckboxProps) => {
  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${error ? 'border-red-300' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className={`font-medium text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}; 