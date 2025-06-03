import React, { forwardRef } from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const width = fullWidth ? 'w-full' : '';

    return (
      <div className={`${width} space-y-1`}>
        <label className="inline-flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              type="radio"
              className="peer sr-only"
              {...props}
            />
            <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white transition-colors group-hover:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-checked:border-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 transform scale-0 transition-transform peer-checked:scale-100" />
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

Radio.displayName = 'Radio';

export default Radio; 