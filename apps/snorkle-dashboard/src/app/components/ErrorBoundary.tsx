'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box my={4}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleRetry}>
                Try again
              </Button>
            }
            sx={{ mb: 2 }}
          >
            <strong>Something went wrong:</strong> {this.state.error?.message || 'An unexpected error occurred'}
          </Alert>
          {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
            <Box mt={2} p={2} bgcolor="#f8d7da" borderRadius={2}>
              <pre style={{ fontSize: 12, color: '#721c24', whiteSpace: 'pre-wrap' }}>
                {this.state.error.stack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
} 