'use client';

import { ReactNode, FormEvent } from 'react';
import { Button } from './button';
import { formStyles } from '@/styles/uiStyles';

export interface BasicFormProps {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  submitText: string;
  isLoading?: boolean;
  footerContent?: ReactNode;
  variant?: 'default' | 'transparent'; // Added variant option
}

export function BasicForm({
  onSubmit,
  children,
  className = "",
  ariaLabel,
  submitText,
  isLoading = false,
  footerContent,
  variant = 'default',
}: BasicFormProps) {
  // Use shared styles with variant support
  const containerStyle = variant === 'default' 
    ? `${formStyles.container} ${formStyles.contentPadding}` 
    : '';

  return (
    <form 
      onSubmit={onSubmit} 
      className={`${containerStyle} ${formStyles.spacing} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
      
      <div className="mt-6">
        <Button 
          className={formStyles.button}
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? `${submitText}...` : submitText}
        </Button>
      </div>
      
      {footerContent && (
        <div className="text-center text-sm text-gray-600 mt-4 text-light">
          {footerContent}
        </div>
      )}
    </form>
  );
}
