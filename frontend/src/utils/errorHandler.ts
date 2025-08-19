/**
 * Error handling utilities for consistent error processing across the application
 */

export interface ParsedError {
  title: string;
  message: string;
  originalError?: Error | unknown;
}

export class ErrorHandler {
  /**
   * Parse complex error structures and extract meaningful messages
   */
  static parseErrorMessage(errorData: unknown): string {
    // 类型保护：检查errorData是否为对象
    if (!errorData || typeof errorData !== 'object') {
      return typeof errorData === 'string' ? errorData : 'Unknown error occurred';
    }

    const errorObj = errorData as Record<string, unknown>;
    
    // If errorData.error is a string, try to parse as JSON
    if (typeof errorObj.error === 'string') {
      try {
        const parsedError = JSON.parse(errorObj.error as string);
        if (parsedError.error && parsedError.error.message) {
          return parsedError.error.message;
        }
      } catch (e) {
        // If parsing fails, return the original string
        return errorObj.error as string;
      }
    }
    
    // If errorData.error is an object
    if (errorObj.error && typeof errorObj.error === 'object') {
      const errorObject = errorObj.error as Record<string, unknown>;
      if (errorObject.message) {
        return errorObject.message as string;
      }
    }
    
    // If there's a direct message field
    if (errorObj.message) {
      return errorObj.message as string;
    }
    
    // If there's a direct error field as string
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    
    // Default generic error message
    return 'Request failed, please try again later';
  }

  /**
   * Categorize errors and provide user-friendly messages
   */
  static categorizeError(error: Error | string): ParsedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const lowerMessage = errorMessage.toLowerCase();
    
    // Document not found errors
    if (lowerMessage.includes("file not found") || lowerMessage.includes("not found")) {
      return {
        title: "Document Not Found",
        message: "Please check if the Google Docs document ID is correct, or confirm you have access to the document",
        originalError: error
      };
    }
    
    // Permission/access errors
    if (lowerMessage.includes("permission") || lowerMessage.includes("forbidden") || lowerMessage.includes("unauthorized")) {
      return {
        title: "Permission Denied",
        message: "You don't have permission to access this document. Please ensure the document is publicly shared or you have access rights",
        originalError: error
      };
    }
    
    // Network-related errors
    if (lowerMessage.includes("network") || lowerMessage.includes("fetch") || lowerMessage.includes("connection")) {
      return {
        title: "Network Error",
        message: "Network connection failed. Please check your connection and try again",
        originalError: error
      };
    }
    
    // Rate limiting errors
    if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
      return {
        title: "Rate Limit Exceeded",
        message: "Too many requests. Please wait a moment and try again",
        originalError: error
      };
    }
    
    // Server errors
    if (lowerMessage.includes("internal server error") || lowerMessage.includes("500")) {
      return {
        title: "Server Error",
        message: "Internal server error. Please try again later",
        originalError: error
      };
    }
    
    // Timeout errors
    if (lowerMessage.includes("timeout")) {
      return {
        title: "Request Timeout",
        message: "The request took too long. Please try again",
        originalError: error
      };
    }
    
    // Default case - return the original error message
    return {
      title: "Operation Failed",
      message: errorMessage || "Please check the document ID or try again later",
      originalError: error
    };
  }

  /**
   * Handle API response errors
   */
  static handleApiError(errorData: unknown): ParsedError {
    const parsedMessage = this.parseErrorMessage(errorData);
    return this.categorizeError(parsedMessage);
  }
}
