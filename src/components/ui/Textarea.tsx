import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helper, className, id, name, ...props },
    ref
  ) => {
    // Generate a unique ID if not provided
    const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaName = name || textareaId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-200 mb-2">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          name={textareaName}
          ref={ref}
          className={clsx(
            'input-base w-full resize-none font-mono text-sm',
            error && 'border-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-slate-400">{helper}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
