import React from 'react';

type ContainerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: any;
  className?: string;
}

export const Container = ({ 
  size = 'lg', 
  children, 
  className = '' 
}: ContainerProps) => {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}; 