import React from 'react';

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  className?: string;
  name?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Select = ({ 
  label, 
  error, 
  className = '', 
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required,
  disabled,
  ...props 
}: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 