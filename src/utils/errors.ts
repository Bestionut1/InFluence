/**
 * Error handling utilities for consistent error management across the application
 */

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public originalError?: Error;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, originalError?: Error) {
    super('VALIDATION_ERROR', message, 400, originalError);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error) {
    super('NETWORK_ERROR', message, 503, originalError);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, originalError?: Error) {
    super('AUTH_ERROR', message, 401, originalError);
    this.name = 'AuthenticationError';
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number = 500, originalError?: Error) {
    super('API_ERROR', message, statusCode, originalError);
    this.name = 'APIError';
  }
}

/**
 * Safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Development logging utility
 */
export function devLog(label: string, message: string | object) {
  if (import.meta.env.DEV) {
    if (typeof message === 'object') {
      console.log(`[${label}]`, message);
    } else {
      console.log(`[${label}] ${message}`);
    }
  }
}

export function devWarn(label: string, message: string | object) {
  if (import.meta.env.DEV) {
    if (typeof message === 'object') {
      console.warn(`[${label}]`, message);
    } else {
      console.warn(`[${label}] ${message}`);
    }
  }
}

export function devError(label: string, message: string | object, error?: Error) {
  if (import.meta.env.DEV) {
    if (typeof message === 'object') {
      console.error(`[${label}]`, message, error);
    } else {
      console.error(`[${label}] ${message}`, error);
    }
  }
}
