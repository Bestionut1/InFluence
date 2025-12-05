import React from 'react';
import clsx from 'clsx';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, isCollapsed = false, onCollapse, children, ...props },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={clsx(
          'bg-slate-900/50 border-r border-slate-800 transition-all duration-300',
          'flex flex-col overflow-y-auto overflow-x-hidden',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
}

export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  (
    { className, title, icon, children, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('p-4', className)} {...props}>
        {(title || icon) && (
          <h3 className="text-sm font-bold text-primary-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            {icon}
            {title}
          </h3>
        )}
        {children}
      </div>
    );
  }
);

SidebarSection.displayName = 'SidebarSection';

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  isActive?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  (
    { className, icon, isActive = false, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          'text-left text-sm hover:bg-slate-800 text-slate-300 hover:text-white',
          isActive && 'bg-primary-500/20 text-primary-200 border-l-2 border-primary-500',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
      </button>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';
