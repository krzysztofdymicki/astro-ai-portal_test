'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  children: ReactNode;
  linkHref?: string;
  linkText?: string;
  className?: string;
  testId?: string;
  disabled?: boolean;
  buttonVariant?: 'default' | 'primary' | 'success';
}

export function DashboardCard({
  title,
  description,
  icon,
  variant = 'default',
  children,
  linkHref,
  linkText = 'View Details',
  className,
  testId,
  disabled = false,
  buttonVariant = 'primary',
}: DashboardCardProps) {
  // Variants for styling
  const variants = {
    default: {
      container: 'bg-white/95 border-slate-200',
      title: 'text-gray-800',
      description: 'text-gray-500',
      button: buttonVariant === 'primary' 
        ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
        : buttonVariant === 'success'
        ? 'bg-green-600 hover:bg-green-500 text-white'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
    },
    success: {
      container: 'bg-white/95 border-green-200',
      title: 'text-green-800',
      description: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-500 text-white'
    },
    warning: {
      container: 'bg-white/95 border-amber-200',
      title: 'text-amber-800',
      description: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-500 text-white'
    },
    info: {
      container: 'bg-white/95 border-blue-200',
      title: 'text-blue-800',
      description: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-500 text-white'
    }
  };

  return (
    <div 
      className={cn(
        'rounded-lg border shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden',
        variants[variant].container,
        className
      )}
      data-testid={testId}
    >
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <h3 className={cn('text-lg font-medium', variants[variant].title)}>
              {title}
            </h3>
          </div>
          {description && (
            <p className={cn('text-sm', variants[variant].description)}>
              {description}
            </p>
          )}
        </div>
        
        {/* Content */}
        <div className="mb-4">
          {children}
        </div>
      </div>
      
      {/* Footer */}
      {linkHref && linkText && (
        <div className="mt-auto p-4 pt-0">
          <Link href={linkHref} className="block w-full">
            <Button 
              className={cn(
                'w-full py-2 px-4 rounded-md transition-colors shadow-sm',
                variants[variant].button
              )}
              disabled={disabled}
            >
              {linkText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
