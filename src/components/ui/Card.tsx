import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  isHoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warm' | 'light';
}

interface CardSubcomponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hoverable,
      isHoverable = hoverable ?? true,
      padding = 'md',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default: 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 shadow-lg',
      warm: 'bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-700/50 shadow-lg shadow-amber-900/20',
      light: 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-lg
          transition-smooth
          ${paddingClasses[padding]}
          ${variantClasses[variant]}
          ${isHoverable ? 'card-hover cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '', ...props }: CardSubcomponentProps) => (
  <div className={`pb-4 border-b border-stone-200 ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.displayName = 'CardHeader';

export const CardBody = ({ children, className = '', ...props }: CardSubcomponentProps) => (
  <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>
);

CardBody.displayName = 'CardBody';

export const CardFooter = ({ children, className = '', ...props }: CardSubcomponentProps) => (
  <div className={`pt-4 border-t border-stone-200 ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.displayName = 'CardFooter';
