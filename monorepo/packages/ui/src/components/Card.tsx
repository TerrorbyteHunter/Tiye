import React from 'react';

type CardProps = {
  title?: string;
  children: string | any;
  className?: string;
  header?: any;
  footer?: any;
}

export const Card = ({ 
  title, 
  children, 
  className = '', 
  header,
  footer 
}: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {(header || title) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header || (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}; 