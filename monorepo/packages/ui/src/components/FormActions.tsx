import React from 'react';
import { Button } from './Button';

type FormActionsProps = {
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onCancel?: () => void;
  className?: string;
}

export const FormActions = ({ 
  submitText = 'Submit', 
  cancelText = 'Cancel',
  isLoading = false,
  onCancel,
  className = '' 
}: FormActionsProps) => {
  return (
    <div className={`flex items-center justify-end space-x-3 ${className}`}>
      {onCancel && (
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          children={cancelText}
        />
      )}
      <Button
        type="submit"
        isLoading={isLoading}
        children={submitText}
      />
    </div>
  );
}; 