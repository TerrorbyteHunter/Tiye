import React from 'react';

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  ...props 
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 