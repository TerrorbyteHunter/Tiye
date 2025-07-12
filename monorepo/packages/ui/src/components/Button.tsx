import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: string | React.ReactElement;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ 
  variant = 'primary', 
  isLoading = false, 
  children, 
  className = '', 
  disabled,
  onClick,
  type = 'button',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const loadingStyles = 'relative text-transparent transition-none hover:text-transparent';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled || isLoading ? disabledStyles : ''}
        ${isLoading ? loadingStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="spinner" />
        </div>
      ) : null}
      {children}
    </button>
  );
}; 