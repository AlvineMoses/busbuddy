/**
 * ThemedModal Component
 * 
 * ONE WAY TO DO MODALS EVERYWHERE - Constitution Compliance
 * 
 * Replaces 18+ duplicate modal implementations with a single reusable component.
 * All modals use createPortal, backdrop blur, and consistent styling.
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ThemedButton } from './ThemedComponents';

interface ThemedModalProps {
  // Core
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  
  // Sizing
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Content
  children: React.ReactNode;
  footer?: React.ReactNode;
  
  // Actions
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'cancel';
  showCancelButton?: boolean;
  
  // Behavior
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  
  // Custom styling
  className?: string;
}

export const ThemedModal: React.FC<ThemedModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  onConfirm,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  showCancelButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  const { colors } = useTheme();

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] isolate">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-black/40 backdrop-blur-md" 
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`relative bg-white rounded-[2rem] p-8 w-full ${sizeClasses[size]} shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex justify-between items-center mb-6">
              {title && (
                <h3 className="text-2xl font-bold text-brand-black">{title}</h3>
              )}
              {showCloseButton && (
                <button 
                  onClick={onClose}
                  className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="modal-content">
            {children}
          </div>
          
          {/* Footer */}
          {(footer || onConfirm) && (
            <div className="mt-8 flex justify-end gap-3">
              {footer ? (
                footer
              ) : (
                <>
                  {showCancelButton && (
                    <ThemedButton variant="cancel" onClick={onClose}>
                      Cancel
                    </ThemedButton>
                  )}
                  {onConfirm && (
                    <ThemedButton 
                      variant={confirmVariant} 
                      onClick={handleConfirm}
                    >
                      {confirmLabel}
                    </ThemedButton>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Specialized modal variant for confirmations
interface ThemedConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'cancel';
}

export const ThemedConfirmDialog: React.FC<ThemedConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
}) => {
  return (
    <ThemedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      confirmVariant={confirmVariant}
    >
      <p className="text-gray-600 text-sm">{message}</p>
    </ThemedModal>
  );
};
