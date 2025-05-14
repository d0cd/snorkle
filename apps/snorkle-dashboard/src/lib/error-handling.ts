export class AleoError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AleoError';
  }
}

export class NetworkError extends AleoError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class DataFetchError extends AleoError {
  constructor(message: string, details?: any) {
    super(message, 'DATA_FETCH_ERROR', details);
    this.name = 'DataFetchError';
  }
}

export class ValidationError extends AleoError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown): AleoError {
  if (error instanceof AleoError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError('Failed to connect to Aleo network', { originalError: error });
    }

    // Handle data fetch errors
    if (error.message.includes('fetch') || error.message.includes('data')) {
      return new DataFetchError('Failed to fetch data from Aleo network', { originalError: error });
    }

    // Handle validation errors
    if (error.message.includes('invalid') || error.message.includes('validation')) {
      return new ValidationError('Invalid data received', { originalError: error });
    }

    // Default error
    return new AleoError(error.message, 'UNKNOWN_ERROR', { originalError: error });
  }

  // Handle non-Error objects
  return new AleoError('An unknown error occurred', 'UNKNOWN_ERROR', { error });
}

export function getErrorMessage(error: AleoError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the Aleo network. Please check your internet connection and try again.';
    case 'DATA_FETCH_ERROR':
      return 'Failed to fetch data from the Aleo network. Please try again later.';
    case 'VALIDATION_ERROR':
      return 'Invalid data received. Please try refreshing the dashboard.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
} 