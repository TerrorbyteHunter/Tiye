import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className = '' }: SpinnerProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="spinner" />
    </div>
  );
};
