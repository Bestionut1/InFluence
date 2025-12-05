import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      icon,
      fullWidth = true,
      className = '',
      type = 'text',
      disabled = false,
      id,
      name,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputName = name || inputId;
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-stone-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            name={inputName}
            ref={ref}
            type={type}
            disabled={disabled}
            className={`
              input-focus
              w-full
              px-4 py-3
              ${icon ? 'pl-12' : 'pl-4'}
              border-2
              rounded-lg
              text-stone-900
              placeholder-stone-400
              bg-white
              transition-smooth
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-amber-500
              ${
                error
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-stone-300 focus:border-amber-400'
              }
              ${disabled ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : ''}
              hover:border-stone-400
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-stone-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
