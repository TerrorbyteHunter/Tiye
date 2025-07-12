import React from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: any;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  actions,
  className = '' 
}: PageHeaderProps) => {
  return (
    <div className={`pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          {actions}
        </div>
      )}
    </div>
  );
}; 