import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const width = fullWidth ? 'w-full' : '';

    return (
      <div className={`${width} space-y-1`}>
        <label className="inline-flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <div className="w-5 h-5 rounded border-2 border-gray-200 bg-white transition-colors group-hover:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
              <Check className="w-4 h-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </div>
          </div>
          {label && (
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {label}
            </span>
          )}
        </label>
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 