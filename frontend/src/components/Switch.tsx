import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
            <div className="w-11 h-6 rounded-full bg-gray-200 transition-colors group-hover:bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
              <div className="w-5 h-5 rounded-full bg-white transform translate-x-0.5 translate-y-0.5 transition-transform peer-checked:translate-x-5" />
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

Switch.displayName = 'Switch';

export default Switch; 