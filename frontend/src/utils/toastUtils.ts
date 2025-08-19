/**
 * Toast utilities for consistent notification handling across the application
 */

import { toast } from 'sonner';
import { ErrorHandler, ParsedError } from './errorHandler';

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastUtils {
  /**
   * Show a success toast
   */
  static success(message: string, options: ToastOptions = {}) {
    toast.success(message, {
      duration: options.duration || 4000,
      description: options.description,
      action: options.action,
    });
  }

  /**
   * Show an error toast
   */
  static error(title: string, message?: string, options: ToastOptions = {}) {
    toast.error(title, {
      duration: options.duration || 5000,
      description: message || options.description,
      action: options.action,
    });
  }

  /**
   * Show an info toast
   */
  static info(message: string, options: ToastOptions = {}) {
    toast.info(message, {
      duration: options.duration || 4000,
      description: options.description,
      action: options.action,
    });
  }

  /**
   * Show a warning toast
   */
  static warning(message: string, options: ToastOptions = {}) {
    toast.warning(message, {
      duration: options.duration || 4000,
      description: options.description,
      action: options.action,
    });
  }

  /**
   * Show a loading toast that can be updated
   */
  static loading(message: string, options: ToastOptions = {}) {
    return toast.loading(message, {
      description: options.description,
    });
  }

  /**
   * Handle and display errors in a consistent way
   */
  static handleError(error: any, context?: string) {
    console.error(`${context ? `${context}: ` : ''}`, error);
    
    let parsedError: ParsedError;
    
    if (error instanceof Error) {
      parsedError = ErrorHandler.categorizeError(error);
    } else if (typeof error === 'object' && error !== null) {
      // Handle API error responses
      parsedError = ErrorHandler.handleApiError(error);
    } else {
      // Handle string errors or other types
      parsedError = ErrorHandler.categorizeError(String(error));
    }
    
    this.error(parsedError.title, parsedError.message, {
      duration: 5000,
    });
    
    return parsedError;
  }

  /**
   * Show a success toast for API operations
   */
  static apiSuccess(operation: string, details?: string) {
    this.success(`${operation} Successful`, {
      description: details,
      duration: 3000,
    });
  }

  /**
   * Dismiss all toasts
   */
  static dismiss() {
    toast.dismiss();
  }

  /**
   * Dismiss a specific toast by ID
   */
  static dismissById(id: string | number) {
    toast.dismiss(id);
  }
}
