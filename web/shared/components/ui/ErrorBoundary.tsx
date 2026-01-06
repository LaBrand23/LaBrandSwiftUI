'use client';

import { Component, ReactNode } from 'react';
import Button from './Button';
import Card from './Card';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 m-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-error-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              An unexpected error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-neutral-100 rounded-lg text-left overflow-auto max-h-48">
                <p className="text-sm font-mono text-error-600">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-neutral-500 mt-2 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button onClick={this.handleReset}>Try Again</Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional error display component
export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred.',
  onRetry,
  showRefresh = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRefresh?: boolean;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon className="w-8 h-8 text-error-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex items-center justify-center gap-3">
        {showRefresh && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
      </div>
    </div>
  );
}

export default ErrorBoundary;
