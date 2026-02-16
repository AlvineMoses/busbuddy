/**
 * ThemedFormField Components
 * 
 * ONE WAY TO DO FORMS EVERYWHERE - Constitution Compliance
 * 
 * Replaces 26+ duplicate input patterns with reusable form components.
 * All form fields follow consistent styling and validation patterns.
 */

import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useTheme } from '../hooks/useTheme';

// Shared base classes - SINGLE SOURCE OF TRUTH
export const INPUT_BASE_CLASS = "w-full mt-2 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-black transition-all font-medium";
export const LABEL_BASE_CLASS = "text-xs font-bold text-gray-400 uppercase tracking-widest";
export const ERROR_CLASS = "text-xs font-medium text-red-500 mt-1";
export const HELPER_TEXT_CLASS = "text-xs text-gray-500 mt-1";

// ============================================
// FORM FIELD WRAPPER
// ============================================

interface ThemedFormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const ThemedFormField: React.FC<ThemedFormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className={LABEL_BASE_CLASS}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className={ERROR_CLASS}>{error}</p>}
      {!error && helperText && <p className={HELPER_TEXT_CLASS}>{helperText}</p>}
    </div>
  );
};

// ============================================
// TEXT INPUT
// ============================================

interface ThemedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  label,
  required,
  error,
  helperText,
  containerClassName,
  ...inputProps
}) => {
  return (
    <ThemedFormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <input
        {...inputProps}
        className={`${INPUT_BASE_CLASS} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
    </ThemedFormField>
  );
};

// ============================================
// SELECT DROPDOWN
// ============================================

interface ThemedSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
  containerClassName?: string;
}

export const ThemedSelect: React.FC<ThemedSelectProps> = ({
  label,
  required,
  error,
  helperText,
  options,
  children,
  containerClassName,
  ...selectProps
}) => {
  return (
    <ThemedFormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <select
        {...selectProps}
        className={`${INPUT_BASE_CLASS} ${error ? 'border-red-500 focus:ring-red-500' : ''} cursor-pointer appearance-none`}
      >
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
    </ThemedFormField>
  );
};

// ============================================
// TEXTAREA
// ============================================

interface ThemedTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const ThemedTextarea: React.FC<ThemedTextareaProps> = ({
  label,
  required,
  error,
  helperText,
  containerClassName,
  ...textareaProps
}) => {
  return (
    <ThemedFormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <textarea
        {...textareaProps}
        className={`${INPUT_BASE_CLASS} ${error ? 'border-red-500 focus:ring-red-500' : ''} resize-none`}
      />
    </ThemedFormField>
  );
};

// ============================================
// TIME INPUT (Specialized for route times)
// ============================================

interface ThemedTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const ThemedTimeInput: React.FC<ThemedTimeInputProps> = ({
  label,
  required,
  error,
  helperText,
  containerClassName,
  ...inputProps
}) => {
  return (
    <ThemedFormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <input
        {...inputProps}
        type="time"
        className={`${INPUT_BASE_CLASS} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
    </ThemedFormField>
  );
};
