import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ className = '', iconOnly = false }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center text-gray-600 hover:text-blue-600 transition-colors ${className}`}
    >
      <svg
        className="w-5 h-5 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {!iconOnly && 'Back'}
    </button>
  );
}; 