import React from 'react';

type FormRadioProps = {
  label: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const FormRadio = ({ 
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '' 
}: FormRadioProps) => {
  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-5 items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            h-4 w-4 border-gray-300 text-blue-600
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