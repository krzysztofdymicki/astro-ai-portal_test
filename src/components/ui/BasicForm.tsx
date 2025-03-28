'use client';

import { ReactNode, FormEvent } from 'react';
import { Button } from './button';

export interface BasicFormProps {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  submitText: string;
  isLoading?: boolean;
  footerContent?: ReactNode;
}

export function BasicForm({
  onSubmit,
  children,
  className = "space-y-4",
  ariaLabel,
  submitText,
  isLoading = false,
  footerContent,
}: BasicFormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={className}
      aria-label={ariaLabel}
    >
      {children}
      
      <div className="mt-6">
        <Button 
          className="w-full btn-primary"
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
