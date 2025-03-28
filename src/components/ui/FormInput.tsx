import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  label: ReactNode; // Changed from string to ReactNode to allow JSX elements
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  testId?: string;
  actionElement?: ReactNode;
  showPasswordToggle?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error = false,
  required = false,
  className = '',
  placeholder,
  testId,
  actionElement,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const isEmpty = value.trim() === '';
  
  return (
    <div className="space-y-2">
      <div className={`flex justify-between items-center ${actionElement ? 'w-full' : ''}`}>
        <Label htmlFor={id} className="form-label" data-testid={`${id}-label`}>
          {label}
        </Label>
        {actionElement}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          name={id}
          value={value}
          onChange={onChange}
          className={`form-input ${showPasswordToggle ? 'pr-10' : ''} 
                     ${error ? 'error' : ''} 
                     ${isEmpty ? 'bg-slate-50/40 border-slate-200' : ''} 
                     ${className}`}
          required={required}
          placeholder={placeholder}
          data-testid={testId || `${id}-input`}
          aria-labelledby={`${id}-label`}
          data-empty={isEmpty}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            data-testid="toggle-password-visibility"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
