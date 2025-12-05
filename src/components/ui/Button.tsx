import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      icon,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    // Variant classes
    const variantClasses = {
      primary: `
        bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800
        text-white font-semibold
        border-0 shadow-md shadow-orange-900/40
        hover:shadow-lg hover:shadow-orange-700/50 hover:scale-102
        active:scale-98 active:shadow-sm
        disabled:from-stone-400 disabled:via-stone-500 disabled:to-stone-600 disabled:text-stone-700
        disabled:border-stone-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
      `,
      secondary: `
        bg-gradient-to-br from-teal-700 to-teal-800
        text-white font-semibold
        border-0 shadow-md shadow-teal-900/40
        hover:shadow-lg hover:shadow-teal-700/50 hover:scale-102
        active:scale-98 active:shadow-sm
        disabled:from-stone-400 disabled:to-stone-500 disabled:text-stone-700
        disabled:border-stone-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
      `,
      tertiary: `
        bg-gradient-to-br from-indigo-700 to-indigo-800
        text-white font-semibold
        border-0 shadow-md shadow-indigo-900/40
        hover:shadow-lg hover:shadow-indigo-700/50 hover:scale-102
        active:scale-98 active:shadow-sm
        disabled:from-stone-400 disabled:to-stone-500 disabled:text-stone-700
        disabled:border-stone-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
      `,
      ghost: `
        bg-transparent
        text-stone-400 font-medium
        border-2 border-stone-600
        hover:bg-stone-800/40 hover:border-stone-500 hover:text-stone-200 hover:shadow-md
        active:bg-stone-700/40
        disabled:text-stone-600 disabled:border-stone-700 disabled:cursor-not-allowed
      `,
      danger: `
        bg-gradient-to-br from-red-700 to-red-800
        text-white font-semibold
        border-0 shadow-md shadow-red-900/40
        hover:shadow-lg hover:shadow-red-700/50 hover:scale-102
        active:scale-98 active:shadow-sm
        disabled:from-stone-400 disabled:to-stone-500 disabled:text-stone-700
        disabled:border-stone-400 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
      `,
      outline: `
        bg-transparent
        text-orange-700 font-semibold
        border-2 border-orange-700
        hover:bg-orange-700/15 hover:shadow-md hover:shadow-orange-800/30
        active:bg-orange-700/25
        disabled:text-stone-600 disabled:border-stone-700 disabled:cursor-not-allowed disabled:shadow-none
      `,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          btn-hover
          rounded-lg
          transition-smooth
          flex items-center justify-center gap-2
          whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${isLoading ? 'opacity-70' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 spin-animation"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {icon && !isLoading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
