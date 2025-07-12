import React from 'react';
import { FormRadio } from './FormRadio';

type Option = {
  label: string;
  value: string;
}

type FormRadioGroupProps = {
  label?: string;
  name?: string;
  value?: string;
  options: Option[];
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const FormRadioGroup = ({ 
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  error,
  className = '' 
}: FormRadioGroupProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.value}>
            <FormRadio
              label={option.label}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 