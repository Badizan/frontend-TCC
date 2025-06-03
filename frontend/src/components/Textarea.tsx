import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = false, size = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'block w-full rounded-xl border-2 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
    const errorStyles = 'border-red-300 focus:border-red-500 focus:ring-red-500';
    const normalStyles = 'border-gray-200 focus:border-blue-500 focus:ring-blue-500';
    const width = fullWidth ? 'w-full' : '';

    const sizes = {
      sm: 'text-sm min-h-[80px]',
      md: 'text-base min-h-[100px]',
      lg: 'text-lg min-h-[120px]'
    };

    return (
      <div className={`${width} space-y-1`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            ${baseStyles}
            ${error ? errorStyles : normalStyles}
            ${sizes[size]}
            ${className}
          `}
          {...props}
        />
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 