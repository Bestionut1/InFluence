import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            modal-content
            ${sizeClasses[size]}
            w-full
            bg-white
            rounded-lg
            border-2 border-stone-200
            shadow-xl
            overflow-hidden
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b-2 border-stone-200">
              {title && (
                <h2 className="text-xl font-bold text-stone-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    p-2
                    hover:bg-stone-100
                    rounded-lg
                    transition-smooth
                    text-stone-600
                    hover:text-stone-900
                    border-2 border-transparent hover:border-stone-300
                  "
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t-2 border-stone-200 flex gap-3 justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b-2 border-stone-200">
    <h2 className="text-xl font-bold text-stone-900">{title}</h2>
    {onClose && (
      <button
        onClick={onClose}
        className="p-2 hover:bg-stone-100 rounded-lg transition-smooth"
      >
        <X className="w-5 h-5 text-stone-600" />
      </button>
    )}
  </div>
);

interface ModalBodyProps {
  children: ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <div className="p-6">{children}</div>
);

interface ModalFooterProps {
  children: ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="px-6 py-4 border-t-2 border-stone-200 flex gap-3 justify-end">
    {children}
  </div>
);
