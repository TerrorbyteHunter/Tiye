import React from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: any;
  icon?: any;
  className?: string;
}

export const EmptyState = ({ 
  title, 
  description, 
  action,
  icon,
  className = '',
  gradient = true,
  glass = true,
}: EmptyStateProps & { gradient?: boolean; glass?: boolean }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${
        gradient ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-400' : ''
      } ${glass ? 'backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl' : ''} ${className}`}
    >
      {icon && (
        <div className="mx-auto h-16 w-16 text-indigo-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow">{title}</h3>
      {description && (
        <p className="text-base text-white/80 mb-4 text-center">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}; 