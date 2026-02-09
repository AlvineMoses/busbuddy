/**
 * Toast Notification Component
 * 
 * Displays toast notifications from Redux state
 * Automatically dismisses after duration
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../src/store/slices/uiSlice';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(id));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, dispatch]);

  const handleDismiss = () => {
    dispatch(removeToast(id));
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-green-200 shadow-green-100';
      case 'error':
        return 'bg-white border-red-200 shadow-red-100';
      case 'warning':
        return 'bg-white border-yellow-200 shadow-yellow-100';
      default:
        return 'bg-white border-blue-200 shadow-blue-100';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-lg ${getStyles()} animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      {getIcon()}
      <p className="flex-1 text-sm font-bold text-brand-black">{message}</p>
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useSelector((state: any) => state.ui.toasts) as ToastProps[];

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ width: '400px', maxWidth: 'calc(100vw - 3rem)' }}
    >
      <div className="pointer-events-auto flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
